"""HTML content parser for extracting videos, attachments, and links."""

from __future__ import annotations

import logging
import re

from bs4 import BeautifulSoup

from hotmart_downloader.models import (
    Attachment,
    ContentType,
    LessonContent,
    SubtitleTrack,
    VideoContent,
)

logger = logging.getLogger(__name__)

# Patterns for detecting video sources
VIMEO_PATTERN = re.compile(r"vimeo\.com/(?:video/)?(\d+)")
YOUTUBE_PATTERN = re.compile(r"(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([\w-]+)")
WISTIA_PATTERN = re.compile(r"wistia\.(?:com|net)/(?:medias|embed/iframe)/([\w]+)")


def parse_lesson_page(page_data: dict) -> LessonContent:
    """Parse a lesson page response and extract all downloadable content."""
    content = LessonContent()

    # Extract videos from mediasSrc (Hotmart native HLS)
    medias = page_data.get("mediasSrc", [])
    if isinstance(medias, list):
        for media in medias:
            media_url = media.get("mediaSrcUrl", "")
            if media_url:
                content.videos.append(VideoContent(
                    url=media_url,
                    content_type=ContentType.VIDEO_HLS,
                    filename=media.get("mediaName", "video"),
                ))
                logger.debug("Found HLS video: %s", media_url)

            # Extract captions associated with this media
            captions = media.get("captions", media.get("subtitles", []))
            if isinstance(captions, list):
                for cap in captions:
                    cap_url = cap.get("url", cap.get("src", ""))
                    if cap_url:
                        content.subtitles.append(SubtitleTrack(
                            url=cap_url,
                            language=cap.get("language", cap.get("lang", "")),
                            label=cap.get("label", ""),
                            format=_detect_subtitle_format(cap_url),
                        ))
                        logger.debug("Found caption from API: %s", cap_url)

    # Extract top-level captions/subtitles field (futureproofing)
    for field_name in ("captions", "subtitles"):
        top_captions = page_data.get(field_name, [])
        if isinstance(top_captions, list):
            for cap in top_captions:
                cap_url = cap.get("url", cap.get("src", ""))
                if cap_url:
                    content.subtitles.append(SubtitleTrack(
                        url=cap_url,
                        language=cap.get("language", cap.get("lang", "")),
                        label=cap.get("label", ""),
                        format=_detect_subtitle_format(cap_url),
                    ))
                    logger.debug("Found top-level caption: %s", cap_url)

    # Extract attachments from fileMembershipSrc
    files = page_data.get("fileMembershipSrc", [])
    if isinstance(files, list):
        for file_data in files:
            file_url = file_data.get("fileMembershipUrl", file_data.get("url", ""))
            file_name = file_data.get("fileMembershipName", file_data.get("name", "attachment"))
            if file_url:
                content.attachments.append(Attachment(
                    url=file_url,
                    filename=file_name,
                ))
                logger.debug("Found attachment: %s", file_name)

    # Parse HTML content for embedded videos and links
    html_content = page_data.get("content", "")
    if html_content:
        _parse_html_content(html_content, content)

    # Extract description text
    description = page_data.get("description", "")
    if description:
        content.description = _clean_html(description)

    return content


def _parse_html_content(html: str, content: LessonContent) -> None:
    """Parse HTML body for embedded videos and links."""
    soup = BeautifulSoup(html, "html.parser")

    # Find iframes (Vimeo, YouTube, Wistia embeds)
    for iframe in soup.find_all("iframe"):
        src = iframe.get("src", "")
        if not src:
            continue

        if VIMEO_PATTERN.search(src):
            content.videos.append(VideoContent(
                url=src,
                content_type=ContentType.VIDEO_EXTERNAL,
                filename="vimeo_video",
            ))
            logger.debug("Found Vimeo embed: %s", src)

        elif YOUTUBE_PATTERN.search(src):
            content.videos.append(VideoContent(
                url=src,
                content_type=ContentType.VIDEO_EXTERNAL,
                filename="youtube_video",
            ))
            logger.debug("Found YouTube embed: %s", src)

        elif WISTIA_PATTERN.search(src):
            content.videos.append(VideoContent(
                url=src,
                content_type=ContentType.VIDEO_EXTERNAL,
                filename="wistia_video",
            ))
            logger.debug("Found Wistia embed: %s", src)

    # Find <track> tags (HTML5 subtitles)
    for track in soup.find_all("track"):
        src = track.get("src", "")
        if src:
            content.subtitles.append(SubtitleTrack(
                url=src,
                language=track.get("srclang", ""),
                label=track.get("label", ""),
                format=_detect_subtitle_format(src),
            ))
            logger.debug("Found <track> subtitle: %s", src)

    # Find links (PDFs, external resources)
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if not href or href.startswith("#") or href.startswith("javascript:"):
            continue

        # Check if it's a downloadable file
        if _is_downloadable_url(href):
            name = link.get_text(strip=True) or "attachment"
            content.attachments.append(Attachment(
                url=href,
                filename=name,
            ))
        else:
            content.links.append(href)

    # Extract plain text description if not already set
    if not content.description:
        text = soup.get_text(separator="\n", strip=True)
        if text:
            content.description = text


def _is_downloadable_url(url: str) -> bool:
    """Check if a URL points to a downloadable file."""
    download_extensions = {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".pptx",
        ".zip", ".rar", ".7z", ".mp3", ".wav",
    }
    lower = url.lower()
    return any(lower.endswith(ext) for ext in download_extensions)


def _clean_html(html: str) -> str:
    """Strip HTML tags and return clean text."""
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(separator="\n", strip=True)


def _detect_subtitle_format(url: str) -> str:
    """Detect subtitle format from URL extension."""
    lower = url.lower().split("?")[0]
    if lower.endswith(".srt"):
        return "srt"
    if lower.endswith(".vtt") or lower.endswith(".webvtt"):
        return "vtt"
    return ""
