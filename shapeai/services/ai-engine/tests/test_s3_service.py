import pytest
from unittest.mock import MagicMock, patch


def test_download_photo_returns_bytes():
    from app.services.s3_service import download_photo

    mock_resp = MagicMock()
    mock_resp.content = b"image_data"
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.s3_service.requests.get", return_value=mock_resp):
        result = download_photo("https://s3.example.com/uploads/u/a/front.jpg")

    assert result == b"image_data"


def test_download_raises_on_http_error():
    from app.services.s3_service import download_photo
    import requests as req

    with patch("app.services.s3_service.requests.get") as mock_get:
        mock_get.return_value.raise_for_status.side_effect = req.HTTPError("404")
        with pytest.raises(req.HTTPError):
            download_photo("https://s3.example.com/missing.jpg")


def test_delete_both_photos_calls_delete_twice():
    from app.services.s3_service import delete_both_photos

    with patch("app.services.s3_service.s3_client") as mock_s3:
        delete_both_photos(
            "https://bucket.s3.amazonaws.com/uploads/u/a/front.jpg",
            "https://bucket.s3.amazonaws.com/uploads/u/a/back.jpg",
        )

    assert mock_s3.delete_object.call_count == 2
