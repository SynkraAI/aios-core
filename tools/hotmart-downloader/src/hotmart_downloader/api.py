"""Hotmart Club API client."""

from __future__ import annotations

import logging

from requests.exceptions import RequestException

from hotmart_downloader.config import CLUB_API_BASE
from hotmart_downloader.exceptions import APIError
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.models import Course, CourseListItem, Lesson, Module

logger = logging.getLogger(__name__)


class HotmartAPI:
    """Client for the Hotmart Club API v3."""

    def __init__(self, client: HttpClient) -> None:
        self.client = client

    def list_courses(self) -> list[CourseListItem]:
        """List all courses available to the authenticated user."""
        url = f"{CLUB_API_BASE}/membership"
        try:
            response = self.client.get(url)
        except RequestException as e:
            raise APIError(f"Failed to list courses: {e}") from e

        data = response.json()
        resources = data if isinstance(data, list) else data.get("resources", [])

        courses: list[CourseListItem] = []
        for item in resources:
            resource = item.get("resource", item)
            subdomain = resource.get("subdomain", "")
            name = resource.get("name", "Unknown")
            resource_id = str(resource.get("resource_id", resource.get("id", "")))
            role = item.get("role", "")
            status = resource.get("status", "")

            if role == "STUDENT" and status == "ACTIVE":
                courses.append(CourseListItem(
                    resource_id=resource_id,
                    name=name,
                    subdomain=subdomain,
                    role=role,
                    status=status,
                ))

        logger.info("Found %d active courses", len(courses))
        return courses

    def get_course_navigation(self, subdomain: str) -> Course:
        """Fetch the full course structure (modules + lessons)."""
        self.client.set_club_headers(subdomain)
        url = f"{CLUB_API_BASE}/navigation"

        try:
            response = self.client.get(url)
        except RequestException as e:
            raise APIError(f"Failed to get course navigation: {e}") from e

        data = response.json()
        modules_data = data if isinstance(data, list) else data.get("modules", [])

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
                id=str(mod.get("module_id", mod.get("id", ""))),
                name=mod.get("name", f"Module {mod_idx}"),
                order=mod_idx,
                lessons=lessons,
            ))

        course = Course(
            id="",
            name=subdomain,
            subdomain=subdomain,
            modules=modules,
        )

        total_lessons = sum(len(m.lessons) for m in modules)
        logger.info(
            "Course '%s': %d modules, %d lessons",
            subdomain, len(modules), total_lessons,
        )
        return course

    def get_lesson_page(self, subdomain: str, lesson_hash: str) -> dict:
        """Fetch the HTML content of a specific lesson page."""
        self.client.set_club_headers(subdomain)
        url = f"{CLUB_API_BASE}/page/{lesson_hash}"

        try:
            response = self.client.get(url)
        except RequestException as e:
            raise APIError(
                f"Failed to get lesson page {lesson_hash}: {e}"
            ) from e

        return response.json()
