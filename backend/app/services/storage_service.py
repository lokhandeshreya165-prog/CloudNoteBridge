"""Storage service interface and concrete implementations for AWS S3 and Local Storage."""
import os
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Tuple, BinaryIO, Optional, IO, Union, Any
import boto3
from botocore.exceptions import ClientError, BotoCoreError

logger = logging.getLogger(__name__)


class StorageService(ABC):
    """Abstract interface defining required storage operations."""

    @abstractmethod
    def upload_file(self, file_stream: Union[IO[bytes], BinaryIO], storage_key: str, mime_type: str) -> bool:
        """Upload a file binary to the storage backend."""
        pass

    @abstractmethod
    def generate_download_url(self, storage_key: str, original_filename: str, expiration: int = 3600) -> str:
        """Generate a secure, time-limited download URL."""
        pass

    @abstractmethod
    def delete_file(self, storage_key: str) -> bool:
        """Delete an object from the storage backend."""
        pass

    @abstractmethod
    def file_exists(self, storage_key: str) -> bool:
        """Check if an object exists in the storage backend."""
        pass

    @abstractmethod
    def get_storage_provider_name(self) -> str:
        """Return the name of the active storage provider."""
        pass


class S3StorageService(StorageService):
    """AWS S3 implementation using boto3 with server-side encryption and presigned URLs."""

    def __init__(
        self,
        bucket_name: str,
        region_name: str = "us-east-1",
        access_key_id: Optional[str] = None,
        secret_access_key: Optional[str] = None,
        session_token: Optional[str] = None,
        presigned_expiration: int = 3600,
    ):
        self.bucket_name = bucket_name
        self.region_name = region_name
        self.presigned_expiration = presigned_expiration

        client_kwargs = {"region_name": region_name}
        if access_key_id and secret_access_key:
            client_kwargs["aws_access_key_id"] = access_key_id
            client_kwargs["aws_secret_access_key"] = secret_access_key
            if session_token:
                client_kwargs["aws_session_token"] = session_token

        self.s3_client = boto3.client("s3", **client_kwargs)
        logger.info(f"Initialized S3StorageService for bucket '{self.bucket_name}' in region '{self.region_name}'")

    def upload_file(self, file_stream: Union[IO[bytes], BinaryIO], storage_key: str, mime_type: str) -> bool:
        try:
            file_stream.seek(0)
            self.s3_client.upload_fileobj(
                Fileobj=file_stream,
                Bucket=self.bucket_name,
                Key=storage_key,
                ExtraArgs={
                    "ContentType": mime_type,
                    "ServerSideEncryption": "AES256",
                },
            )
            logger.info(f"Successfully uploaded object to S3: {storage_key}")
            return True
        except (ClientError, BotoCoreError) as exc:
            logger.error(f"S3 upload failed for {storage_key}: {str(exc)}")
            return False

    def generate_download_url(self, storage_key: str, original_filename: str, expiration: Optional[int] = None) -> str:
        exp = expiration or self.presigned_expiration
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": storage_key,
                    "ResponseContentDisposition": f'attachment; filename="{original_filename}"',
                },
                ExpiresIn=exp,
            )
            return url
        except (ClientError, BotoCoreError) as exc:
            logger.error(f"Failed to generate presigned S3 download URL for {storage_key}: {str(exc)}")
            raise

    def delete_file(self, storage_key: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=storage_key)
            logger.info(f"Successfully deleted object from S3: {storage_key}")
            return True
        except (ClientError, BotoCoreError) as exc:
            logger.error(f"Failed to delete S3 object {storage_key}: {str(exc)}")
            return False

    def file_exists(self, storage_key: str) -> bool:
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=storage_key)
            return True
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code in ("404", "NoSuchKey"):
                return False
            logger.warning(f"Error checking S3 file existence for {storage_key}: {str(exc)}")
            return False

    def get_storage_provider_name(self) -> str:
        return "aws_s3"


class LocalDevelopmentStorageService(StorageService):
    """Local filesystem storage adapter for local testing and offline development."""

    def __init__(self, base_dir: Optional[str] = None):
        target_dir = base_dir or os.path.join(os.getcwd(), "uploads")
        self.base_dir = os.path.abspath(target_dir)
        os.makedirs(self.base_dir, exist_ok=True)
        logger.info(f"Initialized LocalDevelopmentStorageService at: {self.base_dir}")

    def _resolve_safe_path(self, storage_key: str) -> str:
        # Prevent directory traversal attacks
        normalized = os.path.normpath(storage_key)
        if normalized.startswith("..") or os.path.isabs(normalized):
            raise ValueError(f"Illegal storage key path traversal attempt: {storage_key}")
        full_path = os.path.abspath(os.path.join(self.base_dir, normalized))
        if not full_path.startswith(self.base_dir):
            raise ValueError(f"Path escaped storage sandbox: {storage_key}")
        return full_path

    def upload_file(self, file_stream: Union[IO[bytes], BinaryIO], storage_key: str, mime_type: str) -> bool:
        try:
            dest_path = self._resolve_safe_path(storage_key)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            file_stream.seek(0)
            with open(dest_path, "wb") as f:
                f.write(file_stream.read())
            logger.info(f"Saved file to local storage: {dest_path}")
            return True
        except Exception as exc:
            logger.error(f"Local storage upload failed for {storage_key}: {str(exc)}")
            return False

    def generate_download_url(self, storage_key: str, original_filename: str, expiration: int = 3600) -> str:
        # Returns an API route URL that streams the file safely
        # Format: /api/downloads/local/<storage_key>
        safe_key = storage_key.replace("\\", "/")
        return f"/api/downloads/local/{safe_key}?name={original_filename}"

    def delete_file(self, storage_key: str) -> bool:
        try:
            path = self._resolve_safe_path(storage_key)
            if os.path.isfile(path):
                os.remove(path)
                logger.info(f"Removed local file: {path}")
            return True
        except Exception as exc:
            logger.error(f"Failed to delete local file {storage_key}: {str(exc)}")
            return False

    def file_exists(self, storage_key: str) -> bool:
        try:
            path = self._resolve_safe_path(storage_key)
            return os.path.isfile(path)
        except Exception:
            return False

    def get_local_file_path(self, storage_key: str) -> str:
        """Helper to get verified full path on local disk."""
        path = self._resolve_safe_path(storage_key)
        if not os.path.isfile(path):
            raise FileNotFoundError(f"File not found: {storage_key}")
        return path

    def get_storage_provider_name(self) -> str:
        return "local_storage"


def create_storage_service(config: dict) -> StorageService:
    """
    Factory creating either S3StorageService or LocalDevelopmentStorageService.
    If AWS credentials and bucket are not configured, falls back to local storage
    and displays a clear notice rather than faking S3 uploads.
    """
    provider = config.get("STORAGE_PROVIDER", "auto").lower()
    s3_bucket = config.get("AWS_S3_BUCKET", "").strip()
    aws_region = config.get("AWS_REGION", "us-east-1").strip()
    access_key = config.get("AWS_ACCESS_KEY_ID", "").strip()
    secret_key = config.get("AWS_SECRET_ACCESS_KEY", "").strip()
    session_token = config.get("AWS_SESSION_TOKEN", "").strip() or None
    local_dir_val = config.get("LOCAL_STORAGE_DIR")
    local_dir = str(local_dir_val) if local_dir_val else os.path.join(os.getcwd(), "uploads")

    if provider == "s3" or (provider == "auto" and s3_bucket and (access_key or os.getenv("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI"))):
        try:
            return S3StorageService(
                bucket_name=s3_bucket,
                region_name=aws_region,
                access_key_id=access_key or None,
                secret_access_key=secret_key or None,
                session_token=session_token,
                presigned_expiration=config.get("S3_PRESIGNED_URL_EXPIRATION", 3600),
            )
        except Exception as exc:
            logger.warning(f"Could not initialize S3 client: {exc}. Falling back to LocalDevelopmentStorageService.")

    # Default fallback to LocalDevelopmentStorageService
    return LocalDevelopmentStorageService(base_dir=local_dir)


def get_app_storage_service(app: Any = None) -> StorageService:
    """Helper to safely retrieve the active storage service from Flask application context."""
    if app is None:
        from flask import current_app
        app = current_app
    service = getattr(app, "storage_service", None)
    if isinstance(service, StorageService):
        return service
    # Fallback initialization if accessed outside normal context
    created = create_storage_service(app.config)
    setattr(app, "storage_service", created)
    return created
