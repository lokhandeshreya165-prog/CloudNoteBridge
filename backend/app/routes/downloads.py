"""Download routes supporting AWS S3 presigned URLs and local development streaming."""
import os
from flask import Blueprint, request, jsonify, current_app, send_file
from app.extensions import db
from app.models.note import Note
from app.services.note_service import NoteService
from app.services.storage_service import LocalDevelopmentStorageService, get_app_storage_service
from app.utils.permissions import login_required, get_current_user

downloads_bp = Blueprint("downloads", __name__, url_prefix="/api")


@downloads_bp.route("/notes/<int:note_id>/download", methods=["GET"])
@login_required
def download_note(note_id: int):
    """
    Authenticate student, record download event, and generate an authorized
    short-lived download URL (AWS S3 presigned URL or secure local stream route).
    """
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    note = db.session.get(Note, note_id)
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    storage_service = get_app_storage_service()

    # Verify cloud/local file existence
    if not storage_service.file_exists(note.storage_key):
        return jsonify({
            "success": False,
            "error": "The document file is missing or has been removed from storage.",
            "code": "OBJECT_NOT_FOUND",
        }), 404

    # Record download audit entry
    NoteService.record_download(user, note)

    # Generate download URL
    try:
        download_url = storage_service.generate_download_url(
            storage_key=note.storage_key,
            original_filename=note.original_filename,
            expiration=current_app.config.get("S3_PRESIGNED_URL_EXPIRATION", 3600),
        )
    except Exception as exc:
        return jsonify({
            "success": False,
            "error": "Failed to generate authorized download link. Please try again later.",
        }), 500

    provider_name = storage_service.get_storage_provider_name()

    return jsonify({
        "success": True,
        "download_url": download_url,
        "original_filename": note.original_filename,
        "file_size": note.file_size,
        "mime_type": note.mime_type,
        "storage_mode": provider_name,
        "expires_in_seconds": current_app.config.get("S3_PRESIGNED_URL_EXPIRATION", 3600),
    }), 200


@downloads_bp.route("/downloads/local/<path:storage_key>", methods=["GET"])
def stream_local_file(storage_key: str):
    """Safely stream local document files for local development storage mode."""
    storage_service = get_app_storage_service()
    if not isinstance(storage_service, LocalDevelopmentStorageService):
        return jsonify({"success": False, "error": "Local streaming is only available in local development storage mode."}), 400

    try:
        file_path = storage_service.get_local_file_path(storage_key)
    except (ValueError, FileNotFoundError):
        return jsonify({"success": False, "error": "File not found."}), 404

    download_name = request.args.get("name", os.path.basename(file_path))
    return send_file(
        file_path,
        as_attachment=True,
        download_name=download_name,
    )
