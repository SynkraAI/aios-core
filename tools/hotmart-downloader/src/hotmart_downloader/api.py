"""Hotmart Club API client (new gateway architecture)."""

from __future__ import annotations

import logging

from requests.exceptions import RequestException

from hotmart_downloader.config import CLUB_GATEWAY_BASE, CLUB_HUB_BASE
from hotmart_downloader.exceptions import APIError
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.models import Course, CourseListItem, Lesson, Module

logger = logging.getLogger(__name__)


class HotmartAPI:
    """Client for Hotmart Club Gateway API."""

    def __init__(self, client: HttpClient) -> None:
        self.client = client

    def list_courses(self) -> list[CourseListItem]:
        """List all courses available to the authenticated user."""
        url = f"{CLUB_HUB_BASE}/rest/v2/purchase/?archived=UNARCHIVED"
        try:
            response = self.client.get(url)
        except RequestException as e:
            raise APIError(f"Failed to list courses: {e}") from e

        data = response.json()
        items = data.get("data", [])

        courses: list[CourseListItem] = []
        for item in items:
            product = item.get("product", {})
            club_info = product.get("hotmartClub", {})
            slug = club_info.get("slug", "")

            if not slug:
                continue

            courses.append(CourseListItem(
                resource_id=str(product.get("id", "")),
                name=product.get("name", "Unknown"),
                subdomain=slug,
                role="STUDENT",
                status="ACTIVE",
            ))

        logger.info("Found %d courses with Club access", len(courses))
        return courses

    def get_course_navigation(self, subdomain: str) -> Course:
        """Fetch the full course structure (modules + lessons).

        Requires the product ID which is resolved from the subdomain
        via the purchase list if not already cached.
        """
        product_id = self._resolve_product_id(subdomain)
        self.client.set_club_headers(subdomain, product_id)

        url = f"{CLUB_GATEWAY_BASE}/v1/navigation"
        try:
            response = self.client.get(url)
        except RequestException as e:
            raise APIError(f"Failed to get course navigation: {e}") from e

        data = response.json()
        modules_data = data.get("modules", [])
        if isinstance(data, list):
            modules_data = data

        modules: list[Module] = []
        for mod_idx, mod in enumerate(modules_data, start=1):
            lessons: list[Lesson] = []
            pages = mod.get("pages", [])
            for lesson_idx, page in enumerate(pages, start=1):
                lessons.append(Lesson(
                    id=str(page.get("hash", page.get("id", ""))),
                    name=page.get("name", f"Lesson {lesson_idx}"),
                    order=lesson_idx,
                ))

            modules.append(Module(
                id=str(mod.get("id", mod.get("module_id", ""))),
                name=mod.get("name", f"Module {mod_idx}"),
                order=mod_idx,
                lessons=lessons,
            ))

        # Get the actual course name from product/basic
        course_name = self._get_course_name(subdomain, product_id)

        course = Course(
            id=product_id,
            name=course_name,
            subdomain=subdomain,
            modules=modules,
        )

        total_lessons = sum(len(m.lessons) for m in modules)
        logger.info(
            "Course '%s': %d modules, %d lessons",
            course_name, len(modules), total_lessons,
        )
        return course

    def get_lesson_page(self, subdomain: str, lesson_hash: str) -> dict:
        """Fetch the content of a specific lesson."""
        product_id = self._resolve_product_id(subdomain)
        self.client.set_club_headers(subdomain, product_id)

        url = f"{CLUB_GATEWAY_BASE}/v2/web/lessons/{lesson_hash}"
        try:
            response = self.client.get(url)
        except RequestException as e:
            raise APIError(
                f"Failed to get lesson page {lesson_hash}: {e}"
            ) from e

        return response.json()

    def _get_course_name(
        self, subdomain: str, product_id: str
    ) -> str:
        """Get the real course name from the product/basic endpoint."""
        self.client.set_club_headers(subdomain, product_id)
        url = f"{CLUB_GATEWAY_BASE}/v2/product/basic"
        try:
            response = self.client.get(url)
            data = response.json()
            return data.get("name", subdomain).strip()
        except Exception:
            return subdomain

    def _resolve_product_id(self, subdomain: str) -> str:
        """Resolve a course subdomain to its product ID.

        Caches the mapping so we only call the purchase API once.
        """
        if not hasattr(self, "_product_id_cache"):
            self._product_id_cache: dict[str, str] = {}

        if subdomain in self._product_id_cache:
            return self._product_id_cache[subdomain]

        # Fetch all courses to build the mapping
        url = f"{CLUB_HUB_BASE}/rest/v2/purchase/?archived=UNARCHIVED"
        try:
            response = self.client.get(url)
            data = response.json()
            for item in data.get("data", []):
                product = item.get("product", {})
                club_info = product.get("hotmartClub", {})
                slug = club_info.get("slug", "")
                pid = str(product.get("id", ""))
                if slug and pid:
                    self._product_id_cache[slug] = pid
        except Exception as e:
            logger.warning("Failed to resolve product ID: %s", e)

        product_id = self._product_id_cache.get(subdomain, "")
        if not product_id:
            raise APIError(
                f"Could not find product ID for subdomain '{subdomain}'. "
                "Check the course subdomain with 'hotmart-dl courses'."
            )

        logger.debug(
            "Resolved subdomain '%s' -> product ID '%s'",
            subdomain, product_id,
        )
        return product_id
