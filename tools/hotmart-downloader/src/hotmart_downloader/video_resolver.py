"""Video resolver: captures m3u8 stream URLs from Hotmart embed player.

Hotmart's new gateway API returns embed URLs (cf-embed.play.hotmart.com)
instead of direct HLS URLs. The actual m3u8 stream URLs are only available
when the embed player loads inside an authenticated Club page.

This module uses Playwright to:
1. Login to Hotmart SSO (reusing auth logic)
2. Navigate to the Club lesson page
3. Capture m3u8 URLs from network traffic (Akamai CDN)

The captured URLs contain Akamai auth tokens:
- hdnts: short-lived (~500s) for master playlist
- hdntl: long-lived (~24h) for variant/subtitle playlists
"""

from __future__ import annotations

import contextlib
import logging
import re
import time
from dataclasses import dataclass, field

from hotmart_downloader.config import Settings
from hotmart_downloader.exceptions import DownloadError

logger = logging.getLogger(__name__)

_STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
window.chrome = {runtime: {}};
"""

CLUB_BASE_URL = "https://hotmart.com/pt-BR/club"
M3U8_CDN_PATTERN = "play.hotmart.com"

# Wait times (seconds)
_M3U8_CAPTURE_TIMEOUT = 30
_M3U8_EXTRA_WAIT = 3
_CLUB_CONTEXT_WAIT = 3
_LOGIN_SUBMIT_DELAY = 0.5


@dataclass
class ResolvedMedia:
    """Resolved m3u8 URLs from a Hotmart embed player."""

    master_url: str = ""
    video_urls: list[str] = field(default_factory=list)
    subtitle_urls: list[str] = field(default_factory=list)
    media_code: str = ""


class VideoResolver:
    """Resolves Hotmart embed video URLs to actual m3u8 stream URLs.

    Uses Playwright to navigate to lesson pages in the Hotmart Club,
    where the embed player loads and we capture the m3u8 URLs from
    network traffic on the Akamai CDN.

    Usage::

        with VideoResolver(settings) as resolver:
            media = resolver.resolve("my-course", "12345", "abc123", "xYzCode")
            print(media.master_url)  # https://vod-akm.play.hotmart.com/...
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._pw = None  # playwright context manager
        self._browser = None
        self._context = None
        self._page = None
        self._authenticated = False
        self._club_initialized: set[str] = set()

    def resolve(
        self,
        subdomain: str,
        product_id: str,
        lesson_hash: str,
        media_code: str = "",
        _retried: bool = False,
    ) -> ResolvedMedia:
        """Resolve a lesson's embed video to m3u8 stream URLs.

        Args:
            subdomain: Course Club subdomain (e.g., "formula-high-ticket").
            product_id: Hotmart product ID.
            lesson_hash: Lesson page hash from navigation API.
            media_code: Optional media code for the video.

        Returns:
            ResolvedMedia with captured m3u8 URLs.
        """
        self._ensure_browser()
        self._ensure_authenticated()
        self._ensure_club_context(subdomain)
        try:
            return self._navigate_and_capture(
                subdomain, product_id, lesson_hash, media_code
            )
        except Exception as e:
            if _retried:
                raise
            logger.warning("Capture failed (%s), recovering browser...", e)
            self.close()
            return self.resolve(
                subdomain, product_id, lesson_hash, media_code,
                _retried=True,
            )

    # ------------------------------------------------------------------
    # Browser lifecycle
    # ------------------------------------------------------------------

    def _ensure_browser(self) -> None:
        """Launch browser if not already running (or recover if dead)."""
        if self._browser is not None:
            # Health check: verify the browser is still responsive
            try:
                self._page.evaluate("1+1")
                return
            except Exception:
                logger.warning("Browser is dead, relaunching...")
                self.close()
        # (re)launch below

        try:
            from playwright.sync_api import sync_playwright
        except ImportError as e:
            raise DownloadError(
                "playwright is required for video resolution. "
                "Install: pip install playwright && playwright install chromium"
            ) from e

        logger.info("Launching browser for video resolution...")
        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch(
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
        )
        self._context = self._browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
            viewport={"width": 1280, "height": 720},
        )
        self._context.add_init_script(_STEALTH_JS)
        self._page = self._context.new_page()

    def close(self) -> None:
        """Close the browser and release resources."""
        if self._browser:
            with contextlib.suppress(Exception):
                self._browser.close()
            self._browser = None
        if self._pw:
            with contextlib.suppress(Exception):
                self._pw.stop()
            self._pw = None
        self._page = None
        self._context = None
        self._authenticated = False
        self._club_initialized.clear()

    def __enter__(self) -> VideoResolver:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------

    def _ensure_authenticated(self) -> None:
        """Login to Hotmart SSO if not already authenticated."""
        if self._authenticated:
            return

        from hotmart_downloader.auth import (
            _dismiss_overlays,
            _handle_waf_challenge,
            _save_token_cache,
        )

        page = self._page
        assert page is not None

        # Set up token capture from network
        captured_tokens: list[str] = []

        def _on_token(response: object) -> None:
            try:
                auth = response.request.headers.get("authorization", "")
                if auth.startswith("Bearer eyJ"):
                    captured_tokens.append(auth[7:])
            except Exception:
                pass

        page.on("response", _on_token)

        logger.info("Logging in to Hotmart SSO...")
        page.goto(
            "https://sso.hotmart.com/login",
            wait_until="domcontentloaded",
            timeout=60000,
        )

        with contextlib.suppress(Exception):
            page.wait_for_load_state("networkidle", timeout=15000)

        _dismiss_overlays(page)

        page.wait_for_selector(
            'input[name="username"]', state="visible", timeout=10000
        )
        page.fill('input[name="username"]', self._settings.email)
        page.fill('input[name="password"]', self._settings.password)

        submit_btn = page.locator('button[data-test-id="login-submit"]')
        submit_btn.scroll_into_view_if_needed()
        time.sleep(_LOGIN_SUBMIT_DELAY)
        submit_btn.click()

        logger.info("Waiting for login (may require CAPTCHA)...")
        _handle_waf_challenge(page)

        try:
            page.wait_for_url(
                lambda url: "sso.hotmart.com" not in url,
                timeout=120000,
            )
        except Exception as e:
            raise DownloadError(
                "Login timed out. Check credentials or solve CAPTCHA."
            ) from e

        logger.info("Login successful: %s", page.url.split("?")[0])
        self._authenticated = True

        # Cache the captured API token for future HTTP-only operations
        if captured_tokens:
            with contextlib.suppress(Exception):
                _save_token_cache(captured_tokens[-1])
                logger.debug("Refreshed API token cache from login")

        page.remove_listener("response", _on_token)

    # ------------------------------------------------------------------
    # Club context
    # ------------------------------------------------------------------

    def _ensure_club_context(self, subdomain: str) -> None:
        """Navigate to Club home to establish OIDC auth context.

        The Club SPA at hotmart.com uses a separate OIDC client.
        Navigating to the Club page triggers the OIDC flow which
        authenticates the user's SSO session for Club API access.
        """
        if subdomain in self._club_initialized:
            return

        page = self._page
        assert page is not None

        club_url = f"{CLUB_BASE_URL}/{subdomain}"
        logger.info("Establishing Club context: %s", subdomain)

        page.goto(club_url, wait_until="domcontentloaded", timeout=30000)

        with contextlib.suppress(Exception):
            page.wait_for_load_state("networkidle", timeout=15000)

        time.sleep(_CLUB_CONTEXT_WAIT)
        self._club_initialized.add(subdomain)
        logger.debug("Club context established for: %s", subdomain)

    # ------------------------------------------------------------------
    # m3u8 capture
    # ------------------------------------------------------------------

    def _navigate_and_capture(
        self,
        subdomain: str,
        product_id: str,
        lesson_hash: str,
        media_code: str,
    ) -> ResolvedMedia:
        """Navigate to a lesson page and capture m3u8 URLs from network."""
        page = self._page
        assert page is not None

        captured_m3u8: list[str] = []

        def _on_m3u8(response: object) -> None:
            try:
                url = response.url
                if M3U8_CDN_PATTERN in url and ".m3u8" in url:
                    captured_m3u8.append(url)
                    logger.debug("Captured m3u8: %s", url[:150])
            except Exception:
                pass

        page.on("response", _on_m3u8)

        lesson_url = (
            f"{CLUB_BASE_URL}/{subdomain}"
            f"/products/{product_id}/content/{lesson_hash}"
        )
        logger.info("Navigating to lesson: %s", lesson_hash)

        try:
            page.goto(
                lesson_url, wait_until="domcontentloaded", timeout=30000
            )
        except Exception as e:
            err_msg = str(e)
            if "has been closed" in err_msg or "Target closed" in err_msg:
                raise  # let resolve() retry with fresh browser
            logger.warning("Navigation timeout (continuing): %s", e)

        # Wait for the SPA + embed iframe to fully load (critical for
        # the HLS player to fetch the m3u8 from Akamai CDN).
        with contextlib.suppress(Exception):
            page.wait_for_load_state("networkidle", timeout=30000)

        # Poll for m3u8 URLs in case they arrive after networkidle
        deadline = time.time() + _M3U8_CAPTURE_TIMEOUT
        while time.time() < deadline and not captured_m3u8:
            time.sleep(1)

        # Give extra time for variant and subtitle playlists to load
        if captured_m3u8:
            time.sleep(_M3U8_EXTRA_WAIT)

        page.remove_listener("response", _on_m3u8)

        if not captured_m3u8:
            logger.warning(
                "No m3u8 captured for lesson %s (media_code=%s)",
                lesson_hash, media_code,
            )
            return ResolvedMedia(media_code=media_code)

        return _categorize_m3u8_urls(captured_m3u8, media_code)


def _categorize_m3u8_urls(
    urls: list[str], media_code: str
) -> ResolvedMedia:
    """Categorize captured m3u8 URLs into master, video, and subtitle."""
    result = ResolvedMedia(media_code=media_code)

    for url in urls:
        lower = url.lower()

        if "textstream" in lower:
            result.subtitle_urls.append(url)
        elif "master" in lower or "master-pkg" in lower:
            result.master_url = url
        elif "audio=" in lower and "video=" in lower:
            result.video_urls.append(url)
        else:
            # Unknown m3u8 — treat as master if we don't have one yet
            if not result.master_url:
                result.master_url = url
            else:
                result.video_urls.append(url)

    logger.info(
        "Resolved media_code=%s: master=%s, variants=%d, subtitles=%d",
        media_code,
        bool(result.master_url),
        len(result.video_urls),
        len(result.subtitle_urls),
    )
    return result


def guess_language_from_url(url: str) -> str:
    """Guess subtitle language from HLS URL pattern.

    Hotmart uses patterns like ``textstream_pt_br=1000`` in subtitle
    playlist URLs.
    """
    match = re.search(r"textstream[_-](\w+)", url.lower())
    if match:
        lang = match.group(1)
        # Normalize: pt_br → pt-BR
        parts = lang.split("_")
        if len(parts) == 2:
            return f"{parts[0]}-{parts[1].upper()}"
        return lang
    return ""
