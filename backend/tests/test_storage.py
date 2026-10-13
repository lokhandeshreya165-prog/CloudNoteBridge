"""Automated unit tests for storage adapters and cloud security controls."""
import io
import pytest
from unittest.mock import MagicMock
from app.services.storage_service import LocalDevelopmentStorageService, S3StorageService


def test_local_storage_lifecycle(tmp_path):
    """Test local storage file saving, verification, download route generation, and removal."""
    service = LocalDevelopmentStorageService(base_dir=str(tmp_path))
    content = b"test payload bytes"
    key = "notes/test_doc.pdf"

    # Upload
    assert service.upload_file(io.BytesIO(content), key, "application/pdf") is True
    # Existence
    assert service.file_exists(key) is True
    # Download URL
    url = service.generate_download_url(key, "test_doc.pdf")
    assert "/api/downloads/local/notes/test_doc.pdf" in url
    # Delete
    assert service.delete_file(key) is True
    assert service.file_exists(key) is False


def test_local_storage_prevents_path_traversal(tmp_path):
    """Attempting path traversal must raise ValueError."""
    service = LocalDevelopmentStorageService(base_dir=str(tmp_path))
    with pytest.raises(ValueError):
        service._resolve_safe_path("../../etc/passwd")


def test_s3_storage_mock():
    """Verify S3StorageService invokes boto3 client with proper parameters."""
    service = S3StorageService(bucket_name="my-academic-bucket", region_name="us-east-1")
    # Mock boto3 client
    mock_client = MagicMock()
    mock_client.generate_presigned_url.return_value = "https://s3.amazonaws.com/my-academic-bucket/notes/uuid.pdf?presigned=true"
    service.s3_client = mock_client

    # Test upload call
    stream = io.BytesIO(b"data")
    assert service.upload_file(stream, "notes/uuid.pdf", "application/pdf") is True
    mock_client.upload_fileobj.assert_called_once()
    call_kwargs = mock_client.upload_fileobj.call_args[1]
    assert call_kwargs["Bucket"] == "my-academic-bucket"
    assert call_kwargs["Key"] == "notes/uuid.pdf"
    assert call_kwargs["ExtraArgs"]["ServerSideEncryption"] == "AES256"

    # Test presigned URL call
    url = service.generate_download_url("notes/uuid.pdf", "lecture.pdf", expiration=1800)
    assert "https://s3.amazonaws.com" in url
    mock_client.generate_presigned_url.assert_called_once_with(
        ClientMethod="get_object",
        Params={
            "Bucket": "my-academic-bucket",
            "Key": "notes/uuid.pdf",
            "ResponseContentDisposition": 'attachment; filename="lecture.pdf"',
        },
        ExpiresIn=1800,
    )
