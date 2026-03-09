"""DOM scraper for Cademi courses using Playwright.

Cademi has no public API, so all content extraction happens via browser
automation. This module manages a persistent Playwright browser session
that navigates Cademi pages and extracts course structure and content.

Key strategies:
- list_courses(): Navigate vitrine, extract course cards
- get_course_structure(): Extract sidebar/accordion of modules+lessons
- get_lesson_content(): Multi-layer extraction (iframes, video tags,
  network interception, script JSON)
"""

from __future__ import annotations

import contextlib
import json
import logging
import re
import time
from dataclasses import dataclass

from cademi_downloader.config import Settings
from cademi_downloader.exceptions import AuthenticationError, ScraperError
from cademi_downloader.models import (
    Attachment,
    Course,
    CourseListItem,
    Lesson,
    LessonContent,
    Module,
    SubtitleTrack,
    VideoContent,
)

logger = logging.getLogger(__name__)

_STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
window.chrome = {runtime: {}};
"""

# Wait times
_PAGE_LOAD_WAIT = 3
_VIDEO_CAPTURE_TIMEOUT = 15
_VIDEO_EXTRA_WAIT = 2


class CademiScraper:
    """Scrapes Cademi course pages using Playwright browser automation.

    Manages a persistent browser session with authenticated cookies.
    Extracts course structure, video URLs, attachments, and descriptions.

    Usage::

        with CademiScraper(settings, cookies) as scraper:
            courses = scraper.list_courses()
            structure = scraper.get_course_structure(course_url)
            content = scraper.get_lesson_content(lesson_url)
    """

    def __init__(self, settings: Settings, cookies: list[dict]) -> None:
        self._settings = settings
        self._cookies = cookies
        self._pw = None
        self._browser = None
        self._context = None
        self._page = None

    # ------------------------------------------------------------------
    # Browser lifecycle
    # ------------------------------------------------------------------

    def _ensure_browser(self) -> None:
        """Launch browser if not already running."""
        if self._browser is not None:
            try:
                self._page.evaluate("1+1")
                return
            except Exception:
                logger.warning("Browser is dead, relaunching...")
                self.close()

        try:
            from playwright.sync_api import sync_playwright
        except ImportError as e:
            raise ScraperError(
                "playwright is required. "
                "Install: pip install playwright && playwright install chromium"
            ) from e

        logger.info("Launching browser for scraping...")
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

        # Inject authenticated cookies
        if self._cookies:
            self._context.add_cookies(self._cookies)
            logger.debug("Injected %d cookies", len(self._cookies))

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

    def __enter__(self) -> CademiScraper:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    # ------------------------------------------------------------------
    # Course listing
    # ------------------------------------------------------------------

    def list_courses(self) -> list[CourseListItem]:
        """List all courses from the Cademi vitrine page.

        Returns:
            List of CourseListItem with name, url, and optional thumbnail.
        """
        self._ensure_browser()
        page = self._page

        vitrine_url = f"{self._settings.base_url}/area/vitrine"
        logger.info("Navigating to vitrine: %s", vitrine_url)
        page.goto(vitrine_url, wait_until="domcontentloaded", timeout=30000)

        with contextlib.suppress(Exception):
            page.wait_for_load_state("networkidle", timeout=15000)

        time.sleep(_PAGE_LOAD_WAIT)

        # Check if we got redirected to login (session expired)
        if "/login" in page.url.lower():
            raise AuthenticationError(
                "Session expired. Delete .cademi-session-cache.json and re-authenticate."
            )

        # Extract course cards using multiple selector strategies
        courses = page.evaluate("""() => {
            const courses = [];

            // Strategy 1: Look for course cards/links with common patterns
            const selectors = [
                'a[href*="/area/curso/"]',
                'a[href*="/area/product/"]',
                '.course-card a',
                '.product-card a',
                '[class*="course"] a[href]',
                '[class*="product"] a[href]',
                '.card a[href*="/area/"]',
            ];

            const seen = new Set();

            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    const href = el.href || el.getAttribute('href');
                    if (!href || seen.has(href)) continue;
                    seen.add(href);

                    // Get name from various sources
                    let name = '';
                    const titleEl = el.querySelector('h2, h3, h4, .title, [class*="title"], [class*="name"]');
                    if (titleEl) {
                        name = titleEl.textContent.trim();
                    }
                    if (!name) {
                        name = el.textContent.trim().substring(0, 100);
                    }
                    if (!name) continue;

                    // Get thumbnail
                    let thumbnail = '';
                    const img = el.querySelector('img');
                    if (img) {
                        thumbnail = img.src || img.getAttribute('data-src') || '';
                    }

                    courses.push({
                        name: name,
                        url: href,
                        thumbnail: thumbnail,
                    });
                }
            }

            // Strategy 2: If no cards found, look for any links in main content
            if (courses.length === 0) {
                const mainContent = document.querySelector('main, .content, #content, [class*="vitrine"]');
                if (mainContent) {
                    const links = mainContent.querySelectorAll('a[href]');
                    for (const link of links) {
                        const href = link.href;
                        if (!href || seen.has(href) || href.includes('/login')) continue;
                        if (href.includes('/area/') && !href.includes('/vitrine')) {
                            seen.add(href);
                            const name = link.textContent.trim().substring(0, 100);
                            if (name) {
                                courses.push({ name, url: href, thumbnail: '' });
                            }
                        }
                    }
                }
            }

            return courses;
        }""")

        if not courses:
            # Take screenshot for debugging
            page.screenshot(path="/tmp/cademi-vitrine-debug.png")
            logger.warning(
                "No courses found on vitrine. Screenshot saved to /tmp/cademi-vitrine-debug.png"
            )

        result = [
            CourseListItem(
                name=c["name"],
                url=c["url"],
                thumbnail=c.get("thumbnail", ""),
            )
            for c in courses
        ]

        logger.info("Found %d courses on vitrine", len(result))
        return result

    # ------------------------------------------------------------------
    # Course structure
    # ------------------------------------------------------------------

    def get_course_structure(self, course_url: str) -> Course:
        """Extract the full structure of a course (modules + lessons).

        Navigates to the course page and extracts the sidebar/accordion
        structure containing modules and their lessons.

        Args:
            course_url: Full URL of the course page.

        Returns:
            Course object with populated modules and lessons.
        """
        self._ensure_browser()
        page = self._page

        logger.info("Navigating to course: %s", course_url)
        page.goto(course_url, wait_until="domcontentloaded", timeout=30000)

        with contextlib.suppress(Exception):
            page.wait_for_load_state("networkidle", timeout=15000)

        time.sleep(_PAGE_LOAD_WAIT)

        if "/login" in page.url.lower():
            raise AuthenticationError("Session expired during course navigation.")

        # Extract course name
        course_name = page.evaluate("""() => {
            const selectors = [
                'h1', '.course-title', '[class*="course-name"]',
                '[class*="titulo"]', '.title',
            ];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el && el.textContent.trim()) {
                    return el.textContent.trim();
                }
            }
            return document.title || 'Untitled Course';
        }""")

        # Try to expand all modules/accordions before extracting
        page.evaluate("""() => {
            // Click all collapsed accordion headers to expand them
            const expandSelectors = [
                '[class*="accordion"] [class*="header"]',
                '[class*="module"] [class*="header"]',
                '[class*="collapse"]:not(.show)',
                'button[aria-expanded="false"]',
                '[data-toggle="collapse"]',
                '.module-header',
            ];
            for (const sel of expandSelectors) {
                const elements = document.querySelectorAll(sel);
                for (const el of elements) {
                    try { el.click(); } catch(e) {}
                }
            }
        }""")
        time.sleep(1)

        # Extract modules and lessons
        structure = page.evaluate("""() => {
            const modules = [];

            // Strategy 1: Structured accordion/sidebar
            const moduleSelectors = [
                '[class*="module"]',
                '[class*="modulo"]',
                '.accordion-item',
                '[class*="section"]',
            ];

            for (const modSel of moduleSelectors) {
                const modElements = document.querySelectorAll(modSel);
                if (modElements.length === 0) continue;

                for (const modEl of modElements) {
                    // Get module name
                    const headerEl = modEl.querySelector(
                        'h2, h3, h4, .module-title, [class*="title"], [class*="header"], [class*="name"]'
                    );
                    if (!headerEl) continue;
                    const modName = headerEl.textContent.trim();
                    if (!modName) continue;

                    // Get lessons within this module
                    const lessons = [];
                    const lessonLinks = modEl.querySelectorAll('a[href]');
                    const seenUrls = new Set();

                    for (const link of lessonLinks) {
                        const href = link.href || link.getAttribute('href');
                        if (!href || seenUrls.has(href)) continue;
                        // Skip if it's the module header link itself
                        if (link === headerEl || headerEl.contains(link)) continue;

                        const lessonName = link.textContent.trim().substring(0, 200);
                        if (!lessonName) continue;

                        seenUrls.add(href);
                        lessons.push({
                            name: lessonName,
                            url: href,
                        });
                    }

                    if (lessons.length > 0) {
                        modules.push({
                            name: modName,
                            lessons: lessons,
                        });
                    }
                }

                if (modules.length > 0) break;
            }

            // Strategy 2: Flat list of lesson links (no module structure)
            if (modules.length === 0) {
                const allLinks = document.querySelectorAll(
                    'a[href*="/area/"], a[href*="/lesson/"], a[href*="/aula/"], ' +
                    'a[href*="/content/"], a[href*="/conteudo/"]'
                );
                const lessons = [];
                const seenUrls = new Set();

                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seenUrls.has(href) || href.includes('/vitrine') || href.includes('/login')) continue;
                    seenUrls.add(href);
                    const name = link.textContent.trim().substring(0, 200);
                    if (name && name.length > 2) {
                        lessons.push({ name, url: href });
                    }
                }

                if (lessons.length > 0) {
                    modules.push({
                        name: 'Aulas',
                        lessons: lessons,
                    });
                }
            }

            return modules;
        }""")

        if not structure:
            page.screenshot(path="/tmp/cademi-course-debug.png")
            logger.warning(
                "No structure found for course. Screenshot: /tmp/cademi-course-debug.png"
            )

        # Build Course object
        course = Course(
            id=course_url,
            name=course_name,
            url=course_url,
        )

        for mod_idx, mod_data in enumerate(structure, start=1):
            module = Module(
                id=f"mod-{mod_idx}",
                name=mod_data["name"],
                order=mod_idx,
            )
            for les_idx, les_data in enumerate(mod_data.get("lessons", []), start=1):
                lesson = Lesson(
                    id=les_data["url"],
                    name=les_data["name"],
                    url=les_data["url"],
                    order=les_idx,
                )
                module.lessons.append(lesson)
            course.modules.append(module)

        logger.info(
            "Course '%s': %d modules, %d total lessons",
            course.name,
            len(course.modules),
            sum(len(m.lessons) for m in course.modules),
        )
        return course

    # ------------------------------------------------------------------
    # Lesson content extraction
    # ------------------------------------------------------------------

    def get_lesson_content(self, lesson_url: str) -> LessonContent:
        """Extract all downloadable content from a lesson page.

        Uses multiple strategies:
        1. Direct video/source tags
        2. Iframe embeds (Vimeo, YouTube, Bunny, Presto Player)
        3. Network interception for HLS/m3u8 URLs
        4. Script/JSON data extraction
        5. Attachment links (PDF, DOC, etc.)
        6. Page description text

        Args:
            lesson_url: Full URL of the lesson page.

        Returns:
            LessonContent with videos, attachments, subtitles, etc.
        """
        self._ensure_browser()
        page = self._page
        content = LessonContent()

        # Set up network interception for video URLs
        captured_urls: list[dict] = []

        def _on_response(response) -> None:
            try:
                url = response.url
                ct = response.headers.get("content-type", "")
                if any(ext in url.lower() for ext in [".m3u8", ".mpd"]):
                    captured_urls.append({"url": url, "type": "hls"})
                elif "vimeo" in url.lower() and "config" in url.lower():
                    captured_urls.append({"url": url, "type": "vimeo_config"})
            except Exception:
                pass

        page.on("response", _on_response)

        logger.info("Navigating to lesson: %s", lesson_url)
        try:
            page.goto(lesson_url, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            logger.warning("Navigation timeout (continuing): %s", e)

        with contextlib.suppress(Exception):
            page.wait_for_load_state("networkidle", timeout=20000)

        time.sleep(_PAGE_LOAD_WAIT)

        # Wait a bit more for video player to initialize
        deadline = time.time() + _VIDEO_CAPTURE_TIMEOUT
        while time.time() < deadline and not captured_urls:
            time.sleep(1)

        if captured_urls:
            time.sleep(_VIDEO_EXTRA_WAIT)

        page.remove_listener("response", _on_response)

        # Extract videos from network captures
        for cap in captured_urls:
            if cap["type"] == "hls":
                content.videos.append(VideoContent(
                    url=cap["url"],
                    platform="hls",
                ))

        # Extract videos from page DOM
        dom_videos = self._extract_dom_videos(page)
        # Only add DOM videos if we didn't capture them via network
        existing_urls = {v.url for v in content.videos}
        for video in dom_videos:
            if video.url not in existing_urls:
                content.videos.append(video)

        # Extract attachments
        content.attachments = self._extract_attachments(page)

        # Extract description
        content.description = self._extract_description(page)

        # Extract links
        content.links = self._extract_links(page)

        logger.info(
            "Lesson content: %d videos, %d attachments, desc=%d chars",
            len(content.videos),
            len(content.attachments),
            len(content.description),
        )
        return content

    def _extract_dom_videos(self, page) -> list[VideoContent]:
        """Extract video URLs from page DOM (iframes, video tags, scripts)."""
        videos_data = page.evaluate(r"""() => {
            const videos = [];
            const seen = new Set();

            // Strategy 1: iframe embeds
            const iframes = document.querySelectorAll('iframe[src]');
            for (const iframe of iframes) {
                const src = iframe.src || iframe.getAttribute('src');
                if (!src || seen.has(src)) continue;
                seen.add(src);

                let platform = '';
                if (src.includes('vimeo.com')) platform = 'vimeo';
                else if (src.includes('youtube.com') || src.includes('youtu.be')) platform = 'youtube';
                else if (src.includes('bunny') || src.includes('b-cdn')) platform = 'bunny';
                else if (src.includes('presto')) platform = 'presto';
                else if (src.includes('player') || src.includes('embed')) platform = 'embed';

                if (platform) {
                    videos.push({ url: src, platform: platform });
                }
            }

            // Strategy 2: direct video/source tags
            const videoEls = document.querySelectorAll('video source[src], video[src]');
            for (const el of videoEls) {
                const src = el.src || el.getAttribute('src');
                if (!src || seen.has(src)) continue;
                seen.add(src);
                videos.push({ url: src, platform: 'direct' });
            }

            // Strategy 3: Presto Player embeds (WordPress plugin, common in Cademi)
            const prestoEls = document.querySelectorAll(
                '[data-plyr-provider], [data-video-id], [class*="presto"]'
            );
            for (const el of prestoEls) {
                const provider = el.getAttribute('data-plyr-provider') || '';
                const videoId = el.getAttribute('data-video-id') || el.getAttribute('data-plyr-embed-id') || '';

                if (provider === 'vimeo' && videoId) {
                    const url = 'https://player.vimeo.com/video/' + videoId;
                    if (!seen.has(url)) {
                        seen.add(url);
                        videos.push({ url: url, platform: 'vimeo' });
                    }
                } else if (provider === 'youtube' && videoId) {
                    const url = 'https://www.youtube.com/watch?v=' + videoId;
                    if (!seen.has(url)) {
                        seen.add(url);
                        videos.push({ url: url, platform: 'youtube' });
                    }
                }
            }

            // Strategy 4: JSON/script data with video URLs
            const scripts = document.querySelectorAll('script:not([src])');
            for (const script of scripts) {
                const text = script.textContent || '';

                // Look for Vimeo IDs
                const vimeoMatches = text.match(/vimeo[^"']*[/=](\d{7,12})/gi);
                if (vimeoMatches) {
                    for (const match of vimeoMatches) {
                        const idMatch = match.match(/(\d{7,12})/);
                        if (idMatch) {
                            const url = 'https://player.vimeo.com/video/' + idMatch[1];
                            if (!seen.has(url)) {
                                seen.add(url);
                                videos.push({ url: url, platform: 'vimeo' });
                            }
                        }
                    }
                }

                // Look for direct video URLs in JSON
                const urlMatches = text.match(/https?:\/\/[^"'\s]+\.(?:mp4|m3u8|webm)/gi);
                if (urlMatches) {
                    for (const url of urlMatches) {
                        if (!seen.has(url)) {
                            seen.add(url);
                            const platform = url.includes('.m3u8') ? 'hls' : 'direct';
                            videos.push({ url: url, platform: platform });
                        }
                    }
                }

                // Look for Bunny CDN URLs
                const bunnyMatches = text.match(/https?:\/\/[^"'\s]*(?:b-cdn\.net|bunnycdn)[^"'\s]*/gi);
                if (bunnyMatches) {
                    for (const url of bunnyMatches) {
                        if (!seen.has(url) && (url.includes('.mp4') || url.includes('.m3u8'))) {
                            seen.add(url);
                            videos.push({ url: url, platform: 'bunny' });
                        }
                    }
                }
            }

            return videos;
        }""")

        return [
            VideoContent(
                url=v["url"],
                platform=v.get("platform", ""),
            )
            for v in videos_data
        ]

    def _extract_attachments(self, page) -> list[Attachment]:
        """Extract downloadable attachment links from the lesson page."""
        attachments_data = page.evaluate("""() => {
            const attachments = [];
            const seen = new Set();

            // Look for download links
            const downloadSelectors = [
                'a[download]',
                'a[href$=".pdf"]',
                'a[href$=".doc"]',
                'a[href$=".docx"]',
                'a[href$=".xls"]',
                'a[href$=".xlsx"]',
                'a[href$=".pptx"]',
                'a[href$=".zip"]',
                'a[href$=".rar"]',
                'a:has-text("Download")',
                'a:has-text("Baixar")',
                'a:has-text("Material")',
                '[class*="attachment"] a',
                '[class*="material"] a',
                '[class*="download"] a',
            ];

            for (const sel of downloadSelectors) {
                try {
                    const links = document.querySelectorAll(sel);
                    for (const link of links) {
                        const href = link.href || link.getAttribute('href');
                        if (!href || seen.has(href)) continue;
                        // Skip non-download links
                        if (href.includes('/login') || href.includes('/vitrine')) continue;
                        if (href.startsWith('javascript:') || href === '#') continue;

                        seen.add(href);
                        const name = link.getAttribute('download')
                            || link.textContent.trim().substring(0, 100)
                            || 'attachment';

                        attachments.push({
                            url: href,
                            filename: name,
                        });
                    }
                } catch(e) {}
            }

            return attachments;
        }""")

        return [
            Attachment(
                url=a["url"],
                filename=a["filename"],
            )
            for a in attachments_data
        ]

    def _extract_description(self, page) -> str:
        """Extract lesson description/text content."""
        return page.evaluate("""() => {
            // Look for description in common containers
            const selectors = [
                '.lesson-description',
                '.content-description',
                '[class*="description"]',
                '[class*="conteudo"]',
                '.lesson-content',
                'article',
                '.text-content',
            ];

            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    // Get text but exclude video player and navigation elements
                    const clone = el.cloneNode(true);
                    const remove = clone.querySelectorAll(
                        'video, iframe, script, style, nav, .player, [class*="player"]'
                    );
                    for (const r of remove) r.remove();
                    const text = clone.textContent.trim();
                    if (text && text.length > 10) return text;
                }
            }

            return '';
        }""")

    def _extract_links(self, page) -> list[str]:
        """Extract relevant links from the lesson page."""
        return page.evaluate("""() => {
            const links = [];
            const seen = new Set();
            const contentArea = document.querySelector(
                '.lesson-content, .content, article, main'
            ) || document;

            const anchors = contentArea.querySelectorAll('a[href]');
            for (const a of anchors) {
                const href = a.href;
                if (!href || seen.has(href)) continue;
                // Skip internal navigation and common non-content links
                if (href.includes('/login') || href.includes('/vitrine')) continue;
                if (href.startsWith('javascript:') || href === '#') continue;
                if (href.includes('cademi.com.br/area/')) continue;

                // Only include external links (not Cademi internal)
                if (!href.includes('cademi.com.br')) {
                    seen.add(href);
                    links.push(href);
                }
            }

            return links;
        }""")
