"""OAuth authentication with Hotmart Sparkle API."""

from __future__ import annotations

import logging

from requests.exceptions import RequestException

from hotmart_downloader.config import SPARKLE_AUTH_URL, Settings
from hotmart_downloader.exceptions import AuthenticationError
from hotmart_downloader.http_client import HttpClient

logger = logging.getLogger(__name__)


def authenticate(client: HttpClient, settings: Settings) -> str:
    """Authenticate with Hotmart and return the access token.

    Uses the Sparkle security proxy for OAuth login.
    """
    payload = {
        "grant_type": "password",
        "username": settings.email,
        "password": settings.password,
    }

    try:
        response = client.post(SPARKLE_AUTH_URL, data=payload)
    except RequestException as e:
        raise AuthenticationError(f"Failed to connect to auth server: {e}") from e

    data = response.json()
    token = data.get("access_token")

    if not token:
        error_desc = data.get("error_description", "Unknown error")
        raise AuthenticationError(f"Authentication failed: {error_desc}")

    logger.info("Authenticated successfully as %s", settings.email)
    return token
