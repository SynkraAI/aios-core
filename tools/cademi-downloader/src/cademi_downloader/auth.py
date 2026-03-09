"""Authentication with Cademi via Playwright browser automation.

Cademi uses a standard login form (email + password). There is no public API,
so all authentication happens through the browser. Cookies are cached to disk
to avoid re-login on subsequent runs.
"""

from __future__ import annotations

import contextlib
import json
import logging
import time
from pathlib import Path

from cademi_downloader.config import Settings
from cademi_downloader.exceptions import AuthenticationError

logger = logging.getLogger(__name__)

# Cookie cache file location (next to .env in the project dir or CWD)
SESSION_CACHE_FILE = Path(".cademi-session-cache.json")
# Session cache TTL: 12 hours
SESSION_CACHE_TTL = 43200

# JavaScript to reduce bot detection fingerprinting
_STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
window.chrome = {runtime: {}};
"""


def authenticate(settings: Settings) -> list[dict]:
    """Authenticate with Cademi and return valid session cookies.

    Tries cached cookies first. If expired or missing, opens a visible
    browser for login.

    Args:
        settings: Application settings with email, password, and base_url.

    Returns:
        List of cookie dicts from the authenticated browser session.
    """
    cached = _load_cached_cookies()
    if cached:
        logger.info("Using cached session cookies (still valid)")
        return cached

    logger.info("Cached session expired or missing, authenticating via browser...")
    cookies = _browser_login(settings)
    _save_cookie_cache(cookies)
    return cookies


def _load_cached_cookies() -> list[dict] | None:
    """Load cookies from cache if they exist and haven't expired."""
    if not SESSION_CACHE_FILE.exists():
        return None

    try:
        data = json.loads(SESSION_CACHE_FILE.read_text())
        cookies = data.get("cookies", [])
        cached_at = data.get("cached_at", 0)

        if not cookies:
            return None

        now = int(time.time())
        if now >= (cached_at + SESSION_CACHE_TTL):
            logger.debug("Cached cookies expired")
            return None

        return cookies
    except (json.JSONDecodeError, KeyError, TypeError):
        logger.debug("Invalid cookie cache file")
        return None


def _save_cookie_cache(cookies: list[dict]) -> None:
    """Save cookies to cache with timestamp."""
    data = {
        "cookies": cookies,
        "cached_at": int(time.time()),
    }
    SESSION_CACHE_FILE.write_text(json.dumps(data, indent=2))
    logger.debug("Cookies cached (%d cookies)", len(cookies))


def _browser_login(settings: Settings) -> list[dict]:
    """Perform visible browser login to Cademi.

    Opens a Chrome window, navigates to the login page, fills credentials,
    and extracts cookies after successful login.

    Args:
        settings: Application settings.

    Returns:
        List of cookie dicts from the authenticated session.

    Raises:
        AuthenticationError: If login fails.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        raise AuthenticationError(
            "playwright is required for authentication. "
            "Install it: pip install playwright && playwright install chromium"
        ) from e

    cookies = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=False,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                ],
            )
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
                locale="pt-BR",
                timezone_id="America/Sao_Paulo",
                viewport={"width": 1280, "height": 720},
            )
            context.add_init_script(_STEALTH_JS)
            page = context.new_page()

            # Navigate to vitrine (redirects to login if not authenticated)
            entry_url = f"{settings.base_url}/area/vitrine"
            logger.info("Opening Cademi entry page: %s", entry_url)
            page.goto(entry_url, wait_until="domcontentloaded", timeout=60000)

            with contextlib.suppress(Exception):
                page.wait_for_load_state("networkidle", timeout=15000)

            # Dismiss cookie consent if present
            _dismiss_overlays(page)

            # Wait for login form and fill credentials
            logger.info("Filling credentials...")

            # Cademi login form selectors (try multiple patterns)
            email_selectors = [
                'input[name="email"]',
                'input[type="email"]',
                'input[placeholder*="email" i]',
                'input[placeholder*="e-mail" i]',
                'input[id*="email" i]',
                'input[data-testid*="email" i]',
                'label:has-text("E-mail") + input',
                'label:has-text("E-mail") ~ input',
            ]
            password_selectors = [
                'input[name="password"]',
                'input[type="password"]',
                'input[placeholder*="senha" i]',
                'input[placeholder*="password" i]',
                'input[id*="password" i]',
                'input[id*="senha" i]',
                'label:has-text("Senha") + input',
                'label:has-text("Senha") ~ input',
            ]

            email_input = _find_element(page, email_selectors, timeout=15000)

            # Fallback: grab visible text inputs by position (first = email)
            if not email_input:
                logger.debug("Primary selectors failed, trying positional fallback...")
                all_inputs = page.locator("input:visible").all()
                text_inputs = []
                for inp in all_inputs:
                    inp_type = inp.get_attribute("type") or "text"
                    if inp_type in ("text", "email", ""):
                        text_inputs.append(inp)
                if text_inputs:
                    email_input = text_inputs[0]
                    logger.debug("Found email input via positional fallback")

            if not email_input:
                page.screenshot(path="/tmp/cademi-login-debug.png")
                raise AuthenticationError(
                    "Could not find email input on login page. "
                    "Screenshot saved to /tmp/cademi-login-debug.png"
                )

            password_input = _find_element(page, password_selectors, timeout=5000)

            # Fallback: grab visible password-like inputs
            if not password_input:
                logger.debug("Password selectors failed, trying positional fallback...")
                all_inputs = page.locator("input:visible").all()
                for inp in all_inputs:
                    inp_type = inp.get_attribute("type") or "text"
                    if inp_type == "password":
                        password_input = inp
                        logger.debug("Found password input via positional fallback")
                        break

            if not password_input:
                page.screenshot(path="/tmp/cademi-login-debug.png")
                raise AuthenticationError(
                    "Could not find password input on login page. "
                    "Screenshot saved to /tmp/cademi-login-debug.png"
                )

            email_input.fill(settings.email)
            password_input.fill(settings.password)

            # Find and click submit button
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Entrar")',
                'button:has-text("Login")',
                'button:has-text("Acessar")',
            ]
            submit_btn = _find_element(page, submit_selectors, timeout=5000)
            if not submit_btn:
                # Fallback: press Enter
                password_input.press("Enter")
            else:
                submit_btn.scroll_into_view_if_needed()
                time.sleep(0.5)
                submit_btn.click()

            # Wait for navigation away from login page
            logger.info("Waiting for login to complete...")
            try:
                page.wait_for_url(
                    lambda url: "/login" not in url.lower(),
                    timeout=60000,
                )
            except Exception:
                page.screenshot(path="/tmp/cademi-login-debug.png")
                _check_login_error(page)

            logger.info("Login successful, current URL: %s", page.url)

            # Wait for page to stabilize
            with contextlib.suppress(Exception):
                page.wait_for_load_state("networkidle", timeout=10000)

            time.sleep(2)

            # Extract all cookies
            cookies = context.cookies()
            browser.close()

    except AuthenticationError:
        raise
    except Exception as e:
        raise AuthenticationError(f"Browser login failed: {e}") from e

    if not cookies:
        raise AuthenticationError(
            "Login succeeded but no cookies were captured."
        )

    logger.info("Authenticated successfully (%d cookies)", len(cookies))
    return cookies


def _find_element(page: object, selectors: list[str], timeout: int = 5000):
    """Try multiple selectors and return the first visible element found."""
    for selector in selectors:
        try:
            el = page.locator(selector).first
            if el.is_visible(timeout=timeout // len(selectors)):
                return el
        except Exception:
            continue
    return None


def _dismiss_overlays(page: object) -> None:
    """Dismiss cookie consent popups and other overlays."""
    for selector in [
        "button:has-text('OK')",
        "button:has-text('Aceitar')",
        "button:has-text('Accept')",
        "[class*='cookie'] button",
        "[class*='consent'] button",
        "#onetrust-accept-btn-handler",
    ]:
        try:
            el = page.locator(selector).first
            if el.is_visible(timeout=2000):
                el.click(timeout=3000)
                logger.debug("Dismissed overlay: %s", selector)
                time.sleep(1)
                break
        except Exception:
            pass


def _check_login_error(page: object) -> None:
    """Check for login error messages and raise appropriate exception."""
    error_selectors = [
        ".error-message",
        ".alert-danger",
        ".alert-error",
        "[class*='error']",
        "[class*='alert']",
    ]
    for selector in error_selectors:
        try:
            el = page.locator(selector).first
            if el.is_visible(timeout=2000):
                error_text = el.inner_text()
                if error_text.strip():
                    raise AuthenticationError(
                        f"Login failed: {error_text.strip()}"
                    )
        except AuthenticationError:
            raise
        except Exception:
            pass

    raise AuthenticationError(
        "Login timed out. Check your credentials or try again. "
        "Screenshot saved to /tmp/cademi-login-debug.png"
    )
