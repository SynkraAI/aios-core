import os
from urllib.parse import urlparse

import boto3
import requests

BUCKET = os.getenv("S3_BUCKET", "shapeai-photos")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)


def download_photo(url: str) -> bytes:
    """Download photo from presigned URL."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content


def _extract_key(url: str) -> str:
    """Extract S3 object key from URL path."""
    return urlparse(url).path.lstrip("/")


def delete_photo(url: str) -> None:
    s3_client.delete_object(Bucket=BUCKET, Key=_extract_key(url))


def delete_both_photos(front_url: str, back_url: str) -> None:
    """Delete both photos atomically — LGPD compliance."""
    delete_photo(front_url)
    delete_photo(back_url)
