"""Authentication with Hotmart SSO via browser automation.

Hotmart uses OIDC authorization_code flow behind AWS WAF challenge,
which requires a real browser to solve. This module uses Playwright
to automate the login and extract the JWT token.

On first login the browser opens visibly so the user can solve the
WAF CAPTCHA (once). The token is then cached to disk and reused
until it expires — no browser needed on subsequent runs.
"""

from __future__ import annotations

import contextlib
import json
import logging
import time
from pathlib import Path

from hotmart_downloader.config import Settings
from hotmart_downloader.exceptions import AuthenticationError

logger = logging.getLogger(__name__)

# Token cache file location (next to .env in the project dir or CWD)
TOKEN_CACHE_FILE = Path(".hotmart-token-cache.json")
# Refresh token 5 minutes before actual expiry
TOKEN_EXPIRY_BUFFER = 300

# JavaScript to reduce bot detection fingerprinting
_STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
window.chrome = {runtime: {}};
"""


def authenticate(client: object, settings: Settings) -> str:
    """Authenticate with Hotmart and return a valid JWT access token.

    Tries cached token first. If expired or missing, opens a visible
    browser for login (user may need to solve CAPTCHA once).

    Args:
        client: HttpClient instance (unused but kept for API compat).
        settings: Application settings with email and password.

    Returns:
        A valid JWT Bearer token string.
    """
    # Try cached token first
    cached = _load_cached_token()
    if cached:
        logger.info("Using cached token (still valid)")
        return cached

    # No valid cache — perform browser login
    logger.info("Cached token expired or missing, authenticating via browser...")
    token = _browser_login(settings.email, settings.password)
    _save_token_cache(token)
    return token


def _load_cached_token() -> str | None:
    """Load token from cache if it exists and hasn't expired."""
    if not TOKEN_CACHE_FILE.exists():
        return None

    try:
        data = json.loads(TOKEN_CACHE_FILE.read_text())
        token = data.get("token", "")
        expires_at = data.get("expires_at", 0)

        if not token:
            return None

        now = int(time.time())
        if now >= (expires_at - TOKEN_EXPIRY_BUFFER):
            logger.debug("Cached token expired")
            return None

        return token
    except (json.JSONDecodeError, KeyError, TypeError):
        logger.debug("Invalid token cache file")
        return None


def _save_token_cache(token: str) -> None:
    """Save token to cache with expiry extracted from JWT payload."""
    expires_at = _extract_jwt_expiry(token)
    data = {
        "token": token,
        "expires_at": expires_at,
        "cached_at": int(time.time()),
    }
    TOKEN_CACHE_FILE.write_text(json.dumps(data, indent=2))
    logger.debug("Token cached (expires_at=%d)", expires_at)


def _extract_jwt_expiry(token: str) -> int:
    """Extract the 'exp' claim from a JWT without verification."""
    import base64

    try:
        payload_b64 = token.split(".")[1]
        # Add padding
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        return int(payload.get("exp", 0))
    except Exception:
        # If we can't parse expiry, assume 1 hour from now
        return int(time.time()) + 3600


def _browser_login(email: str, password: str) -> str:
    """Perform visible browser login to Hotmart SSO.

    Opens a Chrome window, fills credentials, and lets the user solve
    any CAPTCHA that may appear. The token is extracted automatically
    after successful login.

    Args:
        email: Hotmart account email.
        password: Hotmart account password.

    Returns:
        JWT access token string.

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

    token = None

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

            # Inject stealth JS on every new page/frame
            context.add_init_script(_STEALTH_JS)

            page = context.new_page()

            # Set up network listener to capture tokens from requests
            captured_tokens: list[str] = []

            # Track which domains each token came from
            token_sources: dict[str, str] = {}

            def _on_response(response: object) -> None:
                """Capture JWT tokens from API request Authorization headers."""
                try:
                    auth_header = response.request.headers.get(
                        "authorization", ""
                    )
                    if auth_header.startswith("Bearer eyJ"):
                        jwt = auth_header[7:]
                        url = response.url
                        captured_tokens.append(jwt)
                        token_sources[jwt[:50]] = url[:120]
                        logger.debug("Captured token from: %s", url[:120])
                except Exception:
                    pass

            page.on("response", _on_response)

            # Step 1: Go to login page
            logger.info("Opening Hotmart login page...")
            page.goto(
                "https://sso.hotmart.com/login",
                wait_until="domcontentloaded",
                timeout=60000,
            )

            # Step 2: Wait for page to be interactive
            with contextlib.suppress(Exception):
                page.wait_for_load_state("networkidle", timeout=15000)

            # Step 3: Dismiss cookie consent
            _dismiss_overlays(page)

            # Step 4: Fill credentials and submit
            logger.info("Filling credentials and submitting...")
            page.wait_for_selector(
                'input[name="username"]', state="visible", timeout=10000
            )
            page.fill('input[name="username"]', email)
            page.fill('input[name="password"]', password)

            submit_btn = page.locator('button[data-test-id="login-submit"]')
            submit_btn.scroll_into_view_if_needed()
            time.sleep(0.5)
            submit_btn.click()

            # Step 5: Handle WAF challenge if present
            logger.info("Waiting for authentication (may require CAPTCHA)...")
            _handle_waf_challenge(page)

            # Step 6: Wait for redirect away from SSO
            try:
                page.wait_for_url(
                    lambda url: "sso.hotmart.com" not in url,
                    timeout=120000,  # 2 min — user may need to solve CAPTCHA
                )
            except Exception:
                with contextlib.suppress(Exception):
                    page.screenshot(path="/tmp/hotmart-login-debug.png")
                _check_login_error(page)

            logger.info(
                "Login successful, redirected to: %s",
                page.url.split("?")[0],
            )

            # Step 7: Navigate to pages that trigger authenticated API calls
            # First try Club (triggers api-club token), then purchase area
            logger.info("Navigating to purchase area...")
            page.goto(
                "https://consumer.hotmart.com/purchase",
                wait_until="networkidle",
                timeout=30000,
            )
            time.sleep(3)

            # Get the first course slug from purchase data to navigate into
            course_slug = _find_course_slug_from_page(page)

            if course_slug:
                # Navigate directly into a course Club page
                # This triggers api-club.cb.hotmart.com requests
                club_url = (
                    f"https://hotmart.com/pt-BR/club/{course_slug}"
                )
                logger.info("Navigating into course: %s", course_slug)
                page.goto(
                    club_url,
                    wait_until="networkidle",
                    timeout=30000,
                )
                time.sleep(5)

            token = _extract_api_token(captured_tokens)

            if not token:
                # Fallback: check localStorage and cookies
                token = _extract_token_from_page(page)

            browser.close()

    except AuthenticationError:
        raise
    except Exception as e:
        raise AuthenticationError(f"Browser login failed: {e}") from e

    if not token:
        raise AuthenticationError(
            "Login succeeded but could not extract API token. "
            "The Hotmart frontend may have changed."
        )

    logger.info("Authenticated successfully via browser")
    return token


def _dismiss_overlays(page: object) -> None:
    """Dismiss cookie consent popups and other overlays."""
    logger.debug("Dismissing overlays...")
    for selector in [
        "button:has-text('OK')",
        "button:has-text('Aceitar')",
        "button:has-text('Accept')",
        ".hotmart-cookie-policy-container button",
        "#onetrust-accept-btn-handler",
        "[class*='cookie'] button",
        "[class*='consent'] button",
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

    # Wait for loader to disappear
    with contextlib.suppress(Exception):
        page.wait_for_selector("#loader", state="hidden", timeout=10000)


def _handle_waf_challenge(page: object) -> None:
    """Detect and handle AWS WAF CAPTCHA challenge.

    After login submission, AWS WAF may show a 'Let's confirm you are human'
    page. This function clicks the 'Begin' button and waits for the user
    to solve the CAPTCHA in the visible browser window.
    """
    # Wait a moment for any WAF challenge to appear
    time.sleep(3)

    # Check if WAF challenge page is present
    waf_detected = False
    for indicator in [
        "text=Let's confirm you are human",
        "text=confirm you are human",
        "button:has-text('Begin')",
        "#captcha-container",
    ]:
        try:
            if page.locator(indicator).first.is_visible(timeout=2000):
                waf_detected = True
                break
        except Exception:
            pass

    if not waf_detected:
        logger.debug("No WAF challenge detected")
        return

    logger.info("AWS WAF challenge detected — solve it in the browser window")

    # Click "Begin" button to start the challenge
    try:
        begin_btn = page.locator("button:has-text('Begin')")
        if begin_btn.is_visible(timeout=3000):
            begin_btn.click()
            logger.info("Clicked 'Begin' on WAF challenge")
            time.sleep(2)
    except Exception:
        logger.debug("Could not click Begin button")

    logger.info(
        "Please solve the CAPTCHA in the browser window... "
        "(waiting up to 2 minutes)"
    )


def _check_login_error(page: object) -> None:
    """Check for login error messages and raise appropriate exception."""
    error_el = page.query_selector(
        ".error-message, .alert-danger, [class*='error']"
    )
    if error_el:
        error_text = error_el.inner_text()
        raise AuthenticationError(f"Login failed: {error_text}") from None

    # Check if still on WAF challenge
    try:
        if page.locator("text=confirm you are human").first.is_visible(
            timeout=2000
        ):
            raise AuthenticationError(
                "WAF CAPTCHA was not solved in time. Please try again."
            ) from None
    except AuthenticationError:
        raise
    except Exception:
        pass

    raise AuthenticationError(
        "Login timed out. Check your credentials or try again."
    ) from None


def _find_course_slug_from_page(page: object) -> str | None:
    """Extract a course slug from links on the purchase/club page."""
    try:
        # Look for links to Club courses
        links = page.evaluate("""() => {
            const anchors = document.querySelectorAll('a[href*="/club/"]');
            const slugs = [];
            for (const a of anchors) {
                const match = a.href.match(/\\/club\\/([a-zA-Z0-9_-]+)/);
                if (match && match[1] !== 'club') slugs.push(match[1]);
            }
            return [...new Set(slugs)];
        }""")
        if links:
            logger.debug("Found course slugs: %s", links)
            return links[0]
    except Exception:
        pass
    return None


def _extract_api_token(captured_tokens: list[str]) -> str | None:
    """Return the best token from captured network traffic.

    Returns the most recently captured token (last in list) since it's
    freshest. All captured tokens come from authenticated API requests.
    """
    if not captured_tokens:
        return None
    logger.debug(
        "Found %d token(s) from network traffic", len(captured_tokens)
    )
    return captured_tokens[-1]


def _extract_token_from_page(page: object) -> str | None:
    """Extract JWT token from page localStorage or cookies.

    Hotmart stores bearer tokens in localStorage with domain-based keys.
    We look for tokens associated with the Club API.
    """
    # Try cookies (skip SSO session cookies like TGC)
    try:
        cookies = page.context.cookies()
        for cookie in cookies:
            val = cookie.get("value", "")
            name = cookie.get("name", "")
            domain = cookie.get("domain", "")
            # Skip SSO session cookies (TGC is CAS Ticket Granting Cookie)
            if name in ("TGC", "JSESSIONID", "CASTGC"):
                continue
            if val.startswith("eyJ") and len(val) > 500:
                logger.debug(
                    "Found JWT in cookie: %s (domain: %s)", name, domain
                )
                return val
    except Exception as e:
        logger.debug("Failed to read cookies: %s", e)

    # Try localStorage
    try:
        all_storage = page.evaluate("""() => {
            const result = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                result[key] = localStorage.getItem(key);
            }
            return result;
        }""")

        logger.debug(
            "localStorage keys: %s",
            list(all_storage.keys()),
        )

        # Look for JWT tokens (they start with "eyJ")
        for key, value in all_storage.items():
            if not isinstance(value, str):
                continue

            # Direct JWT value
            if value.startswith("eyJ") and len(value) > 500:
                logger.debug("Found JWT in localStorage key: %s", key)
                return value

            # JSON-encoded token object
            if "club" in key.lower() or "cb.hotmart" in key.lower():
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, str) and parsed.startswith("eyJ"):
                        return parsed
                    if isinstance(parsed, dict):
                        for v in parsed.values():
                            if isinstance(v, str) and v.startswith("eyJ"):
                                return v
                except (json.JSONDecodeError, TypeError):
                    pass

        # Deep scan: JSON values that may contain JWT sub-keys
        for key, value in all_storage.items():
            if isinstance(value, str) and len(value) > 100:
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, dict):
                        for k2, v2 in parsed.items():
                            if (
                                isinstance(v2, str)
                                and v2.startswith("eyJ")
                                and (
                                    "club" in k2
                                    or "cb.hotmart" in k2
                                    or "api" in k2
                                )
                            ):
                                logger.debug(
                                    "Found JWT in %s.%s", key, k2
                                )
                                return v2
                except (json.JSONDecodeError, TypeError):
                    pass

    except Exception as e:
        logger.debug("Failed to read localStorage: %s", e)

    return None
