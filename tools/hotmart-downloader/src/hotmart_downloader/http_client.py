"""HTTP client with retry logic and session management."""

from __future__ import annotations

import logging
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from hotmart_downloader.config import DEFAULT_BACKOFF_FACTOR, DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT

logger = logging.getLogger(__name__)


def create_retry_strategy(
    max_retries: int = DEFAULT_MAX_RETRIES,
    backoff_factor: float = DEFAULT_BACKOFF_FACTOR,
) -> Retry:
    """Create a retry strategy for HTTP requests."""
    return Retry(
        total=max_retries,
        backoff_factor=backoff_factor,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
        raise_on_status=False,
    )


class HttpClient:
    """HTTP client with automatic retry and session management."""

    def __init__(
        self,
        max_retries: int = DEFAULT_MAX_RETRIES,
        timeout: int = DEFAULT_TIMEOUT,
    ) -> None:
        self.timeout = timeout
        self.session = requests.Session()

        retry_strategy = create_retry_strategy(max_retries=max_retries)
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def set_auth_token(self, token: str) -> None:
        """Set the authorization bearer token."""
        self.session.headers["Authorization"] = f"Bearer {token}"

    def set_club_headers(self, subdomain: str) -> None:
        """Set club-specific headers required by the API."""
        origin = f"https://{subdomain}.club.hotmart.com"
        self.session.headers.update({
            "club": subdomain,
            "origin": origin,
            "referer": origin,
        })

    def get(self, url: str, **kwargs: Any) -> requests.Response:
        """Perform a GET request with retry."""
        kwargs.setdefault("timeout", self.timeout)
        logger.debug("GET %s", url)
        response = self.session.get(url, **kwargs)
        response.raise_for_status()
        return response

    def post(self, url: str, **kwargs: Any) -> requests.Response:
        """Perform a POST request with retry."""
        kwargs.setdefault("timeout", self.timeout)
        logger.debug("POST %s", url)
        response = self.session.post(url, **kwargs)
        response.raise_for_status()
        return response

    def download_file(
        self,
        url: str,
        dest: str,
        chunk_size: int = 8192,
    ) -> int:
        """Download a file with streaming. Returns bytes downloaded."""
        logger.debug("Downloading %s -> %s", url, dest)
        response = self.session.get(url, stream=True, timeout=self.timeout)
        response.raise_for_status()

        total_bytes = 0
        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    total_bytes += len(chunk)

        return total_bytes

    def close(self) -> None:
        """Close the underlying session."""
        self.session.close()

    def __enter__(self) -> HttpClient:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()
