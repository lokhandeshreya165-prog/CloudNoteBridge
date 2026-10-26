"""Configuration definitions for CloudNoteBridge."""
import os
from dotenv import load_dotenv

# Load local environment variables from .env if present
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-secret-key-change-in-production")

    # Database configuration
    # Default to MySQL with PyMySQL driver, fallback to SQLite if DATABASE_URL is not set or in test
    raw_db_url = (os.getenv("DATABASE_URL") or "").strip()
    if raw_db_url.startswith("DATABASE_URL="):
        raw_db_url = raw_db_url.replace("DATABASE_URL=", "", 1).strip()

    if raw_db_url:
        SQLALCHEMY_DATABASE_URI = raw_db_url
    else:
        # Default development SQLite database file inside backend directory
        db_path = os.path.join(BASE_DIR, "cloudnotebridge.db").replace("\\", "/")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if SQLALCHEMY_DATABASE_URI.startswith("mysql") else {}

    # Session & Cookie Security
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "False").lower() in ("true", "1", "yes")
    PERMANENT_SESSION_LIFETIME = 86400 * 7  # 7 days

    # CORS Configuration
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]

    # File Upload Restrictions
    MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    MAX_CONTENT_LENGTH = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    ALLOWED_EXTENSIONS = {"pdf", "ppt", "pptx"}

    # Cloud & Local Storage Configuration
    STORAGE_PROVIDER = os.getenv("STORAGE_PROVIDER", "auto")  # 's3', 'local', or 'auto'
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_SESSION_TOKEN = os.getenv("AWS_SESSION_TOKEN", "")
    S3_PRESIGNED_URL_EXPIRATION = int(os.getenv("S3_PRESIGNED_URL_EXPIRATION", "3600"))

    # Local Storage Fallback
    LOCAL_STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", os.path.join(BASE_DIR, "uploads"))


class TestConfig(Config):
    """Configuration for automated test suite."""
    TESTING = True
    SECRET_KEY = "test-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    STORAGE_PROVIDER = "local"
    LOCAL_STORAGE_DIR = os.path.join(BASE_DIR, "test_uploads")
    SESSION_COOKIE_SECURE = False
