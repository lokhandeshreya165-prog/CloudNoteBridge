"""Administrator routes for user directory, content moderation, and reporting."""
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.user import User
from app.models.note import Note
from app.models.report import NoteReport
from app.models.download import DownloadHistory
from app.services.note_service import NoteService
from app.services.storage_service import get_app_storage_service
from app.utils.permissions import admin_required, get_current_user

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    """System overview statistics for administrator dashboard."""
    total_users = User.query.count()
    total_notes = Note.query.count()
    total_downloads = DownloadHistory.query.count()
    pending_reports = NoteReport.query.filter_by(status="pending").count()

    storage_service = get_app_storage_service()

    return jsonify({
        "success": True,
        "stats": {
            "total_users": total_users,
            "total_notes": total_notes,
            "total_downloads": total_downloads,
            "pending_reports": pending_reports,
            "storage_provider": storage_service.get_storage_provider_name(),
        },
    }), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    """List registered users with search and pagination."""
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(50, max(1, int(request.args.get("per_page", 20))))
    search = request.args.get("q", "").strip()

    query = User.query
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )

    query = query.order_by(User.created_at.desc())
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "success": True,
        "users": [u.to_dict() for u in users],
        "total": total,
        "page": page,
        "per_page": per_page,
    }), 200


@admin_bp.route("/notes", methods=["GET"])
@admin_required
def list_notes():
    """List all notes in system for administrative inspection."""
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(50, max(1, int(request.args.get("per_page", 20))))
    search = request.args.get("q", "").strip()

    query = Note.query
    if search:
        query = query.filter(
            (Note.title.ilike(f"%{search}%")) | (Note.subject.ilike(f"%{search}%"))
        )

    query = query.order_by(Note.created_at.desc())
    total = query.count()
    notes = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "success": True,
        "notes": [n.to_dict() for n in notes],
        "total": total,
        "page": page,
        "per_page": per_page,
    }), 200


@admin_bp.route("/notes/<int:note_id>", methods=["DELETE"])
@admin_required
def delete_note(note_id: int):
    """Administrator removal of unauthorized or inappropriate notes."""
    admin_user = get_current_user()
    if not admin_user:
        return jsonify({"success": False, "error": "Administrator authentication required."}), 401

    note = db.session.get(Note, note_id)
    if not note:
        return jsonify({"success": False, "error": "Note not found."}), 404

    storage_service = get_app_storage_service()
    success, error = NoteService.delete_note(note, admin_user, storage_service)
    if not success:
        return jsonify({"success": False, "error": error}), 500

    return jsonify({
        "success": True,
        "message": "Note successfully removed by administrator.",
    }), 200


@admin_bp.route("/reports", methods=["GET"])
@admin_required
def list_reports():
    """List student-submitted moderation reports."""
    status_filter = request.args.get("status", "all").strip().lower()
    query = NoteReport.query

    if status_filter in ("pending", "resolved", "dismissed"):
        query = query.filter_by(status=status_filter)

    reports = query.order_by(NoteReport.created_at.desc()).all()
    return jsonify({
        "success": True,
        "reports": [r.to_dict() for r in reports],
    }), 200


@admin_bp.route("/reports/<int:report_id>", methods=["PATCH"])
@admin_required
def update_report_status(report_id: int):
    """Update moderation report status (resolved, dismissed)."""
    report = db.session.get(NoteReport, report_id)
    if not report:
        return jsonify({"success": False, "error": "Report not found."}), 404

    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "").strip().lower()
    if new_status not in ("resolved", "dismissed", "pending"):
        return jsonify({"success": False, "error": "Invalid status value."}), 400

    report.status = new_status
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Report status marked as {new_status}.",
        "report": report.to_dict(),
    }), 200
