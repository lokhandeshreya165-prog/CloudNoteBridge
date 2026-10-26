"""Health check and root status endpoints for system monitoring."""
from datetime import datetime, timezone
from flask import Blueprint, jsonify, current_app
from sqlalchemy import text
from app.extensions import db

main_bp = Blueprint("main", __name__)
health_bp = Blueprint("health", __name__, url_prefix="/api")


@main_bp.route("/", methods=["GET"])
def index():
    """Root endpoint providing service status and navigation guidance."""
    return jsonify({
        "service": "CloudNoteBridge API",
        "status": "online",
        "version": "1.0.0",
        "message": "CloudNoteBridge backend is running. Open the frontend in your browser to use the application.",
        "frontend_url": "http://localhost:5173",
        "health_check": "/api/health",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth",
            "notes": "/api/notes",
            "downloads": "/api/downloads",
            "profile": "/api/profile",
            "admin": "/api/admin",
        },
    }), 200


@main_bp.route("/favicon.ico", methods=["GET"])
def favicon():
    """Handle browser favicon requests cleanly to avoid 404 logs."""
    return "", 204


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Verify application operational health, database connectivity, and storage provider."""
    # Test database connectivity
    db_ok = False
    db_error = None
    try:
        db.session.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        db_error = str(exc)

    from app.services.storage_service import get_app_storage_service
    storage_provider = get_app_storage_service().get_storage_provider_name()

    status = "healthy" if db_ok else "degraded"
    status_code = 200 if db_ok else 503

    return jsonify({
        "status": status,
        "database": {
            "connected": db_ok,
            "error": db_error,
        },
        "storage": {
            "provider": storage_provider,
            "is_aws_s3": storage_provider == "aws_s3",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), status_code
