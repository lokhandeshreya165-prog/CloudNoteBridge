"""Centralized error handling and JSON error responses."""
import logging
from flask import jsonify

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """Register custom JSON error handlers for common HTTP status codes."""

    @app.errorhandler(400)
    def handle_bad_request(err):
        return jsonify({
            "success": False,
            "error": "Bad Request. Please verify your submitted data.",
            "code": "BAD_REQUEST",
        }), 400

    @app.errorhandler(404)
    def handle_not_found(err):
        return jsonify({
            "success": False,
            "error": "Resource not found.",
            "code": "NOT_FOUND",
        }), 404

    @app.errorhandler(413)
    def handle_payload_too_large(err):
        max_mb = app.config.get("MAX_UPLOAD_SIZE_MB", 25)
        return jsonify({
            "success": False,
            "error": f"File is too large. Maximum allowed size is {max_mb} MB.",
            "code": "FILE_TOO_LARGE",
        }), 413

    @app.errorhandler(500)
    def handle_internal_server_error(err):
        logger.error(f"Internal server error: {err}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal server error occurred. Please try again later.",
            "code": "INTERNAL_ERROR",
        }), 500
