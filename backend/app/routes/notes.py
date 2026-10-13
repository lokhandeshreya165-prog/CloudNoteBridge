"""Course notes search, retrieval, upload, and deletion routes."""
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.note import Note
from app.models.report import NoteReport
from app.services.note_service import NoteService
from app.services.search_service import SearchService
from app.services.storage_service import get_app_storage_service
from app.utils.permissions import login_required, get_current_user

notes_bp = Blueprint("notes", __name__, url_prefix="/api")


@notes_bp.route("/notes", methods=["GET"])
def list_notes():
    """Search and filter notes by subject, department, semester, unit, and file type."""
    params = request.args.to_dict()
    result = SearchService.search_notes(params)
    return jsonify({
        "success": True,
        **result,
    }), 200


@notes_bp.route("/notes/<int:note_id>", methods=["GET"])
def get_note_details(note_id: int):
    """Retrieve detailed metadata for a specific course note."""
    note = db.session.get(Note, note_id)
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    return jsonify({
        "success": True,
        "note": note.to_dict(),
    }), 200


@notes_bp.route("/notes", methods=["POST"])
@login_required
def upload_note():
    """Upload a new course note document with academic metadata."""
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file part in the upload request."}), 400

    file = request.files["file"]
    form_data = request.form.to_dict()
    storage_service = get_app_storage_service()
    max_size = current_app.config.get("MAX_CONTENT_LENGTH", 25 * 1024 * 1024)

    note, error = NoteService.create_note(
        user=user,
        form_data=form_data,
        file=file,
        storage_service=storage_service,
        max_size_bytes=max_size,
    )
    if error or not note:
        return jsonify({"success": False, "error": error or "Failed to upload note."}), 400

    return jsonify({
        "success": True,
        "message": "Note uploaded successfully.",
        "note": note.to_dict(),
        "storage_mode": storage_service.get_storage_provider_name(),
    }), 201


@notes_bp.route("/notes/<int:note_id>", methods=["DELETE"])
@login_required
def delete_note(note_id: int):
    """Delete a note if the current user is the owner or an administrator."""
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    note = db.session.get(Note, note_id)
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    storage_service = get_app_storage_service()
    success, error = NoteService.delete_note(note, user, storage_service)
    if not success:
        return jsonify({"success": False, "error": error}), 403

    return jsonify({
        "success": True,
        "message": "Note deleted successfully.",
    }), 200


@notes_bp.route("/my-notes", methods=["GET"])
@notes_bp.route("/notes/my", methods=["GET"])
@login_required
def my_notes():
    """Retrieve all course notes uploaded by the current student."""
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    params = request.args.to_dict()
    params["uploader_id"] = user.id
    result = SearchService.search_notes(params)
    return jsonify({
        "success": True,
        **result,
    }), 200


@notes_bp.route("/notes/<int:note_id>/report", methods=["POST"])
@login_required
def report_note(note_id: int):
    """Submit a moderation report for a note."""
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    note = db.session.get(Note, note_id)
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    data = request.get_json(silent=True) or {}
    reason = str(data.get("reason", "")).strip()
    description = str(data.get("description", "")).strip()

    if not reason:
        return jsonify({"success": False, "error": "Reason is required."}), 400

    report = NoteReport(
        note_id=note.id,
        reporter_id=user.id,
        reason=reason,
        description=description,
        status="pending",
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Report submitted for review. Thank you for keeping CloudNoteBridge clean.",
    }), 201
