"""Authentication routes for student and administrator sessions."""
from flask import Blueprint, request, jsonify, session
from app.services.auth_service import AuthService
from app.utils.permissions import login_required, get_current_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new student account."""
    data = request.get_json(silent=True) or {}
    user, error = AuthService.register_user(data)
    if error or not user:
        return jsonify({"success": False, "error": error or "Registration failed."}), 400

    # Auto-login upon successful registration
    session.permanent = True
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Account registered successfully.",
        "user": user.to_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate student or administrator credentials."""
    data = request.get_json(silent=True) or {}
    user, error = AuthService.authenticate_user(data)
    if error or not user:
        return jsonify({"success": False, "error": error or "Authentication failed."}), 401

    session.permanent = True
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.full_name}!",
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Terminate current user session."""
    session.clear()
    return jsonify({
        "success": True,
        "message": "Logged out successfully.",
    }), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    """Return currently authenticated user profile or null."""
    user = get_current_user()
    if not user:
        return jsonify({"success": True, "user": None}), 200

    return jsonify({
        "success": True,
        "user": user.to_dict(),
    }), 200
