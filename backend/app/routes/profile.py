"""User profile endpoints."""
from flask import Blueprint, request, jsonify
from app.models.note import Note
from app.models.download import DownloadHistory
from app.services.auth_service import AuthService
from app.utils.permissions import login_required, get_current_user

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")


@profile_bp.route("", methods=["GET"])
@login_required
def get_profile():
    """Return authenticated student profile and academic metrics."""
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    uploads_count = Note.query.filter_by(uploader_id=user.id).count()

    # Total downloads of this user's notes
    user_note_ids = [n.id for n in Note.query.filter_by(uploader_id=user.id).all()]
    total_downloads = (
        DownloadHistory.query.filter(DownloadHistory.note_id.in_(user_note_ids)).count()
        if user_note_ids
        else 0
    )

    data = user.to_dict()
    data["stats"] = {
        "uploads_count": uploads_count,
        "total_downloads_received": total_downloads,
    }

    return jsonify({
        "success": True,
        "profile": data,
    }), 200


@profile_bp.route("", methods=["PATCH"])
@login_required
def update_profile():
    """Update approved student profile fields without privilege escalation."""
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    data = request.get_json(silent=True) or {}

    updated_user, error = AuthService.update_profile(user, data)
    if error or not updated_user:
        return jsonify({"success": False, "error": error or "Failed to update profile."}), 400

    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "profile": updated_user.to_dict(),
    }), 200
