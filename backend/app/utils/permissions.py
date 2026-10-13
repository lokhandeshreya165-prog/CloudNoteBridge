"""Authentication and role-based access decorators and helpers."""
from functools import wraps
from typing import Optional
from flask import session, jsonify, g
from app.extensions import db
from app.models.user import User


def get_current_user() -> Optional[User]:
    """Retrieve current authenticated User instance based on session."""
    user_id = session.get("user_id")
    if not user_id:
        return None

    if hasattr(g, "current_user") and g.current_user and g.current_user.id == user_id:
        return g.current_user

    user = db.session.get(User, user_id)
    if user and user.is_active:
        g.current_user = user
        return user

    # Clear invalid/inactive session
    session.pop("user_id", None)
    return None


def login_required(f):
    """Decorator requiring an authenticated user session."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({
                "success": False,
                "error": "Authentication required. Please sign in.",
                "code": "UNAUTHORIZED"
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """Decorator requiring an authenticated administrator session."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({
                "success": False,
                "error": "Authentication required. Please sign in.",
                "code": "UNAUTHORIZED"
            }), 401
        if not user.is_admin:
            return jsonify({
                "success": False,
                "error": "Access denied. Administrator privileges required.",
                "code": "FORBIDDEN"
            }), 403
        return f(*args, **kwargs)
    return decorated_function


def can_manage_note(user: User, note) -> bool:
    """Check if the user is the note owner or an administrator."""
    if not user or not note:
        return False
    return user.is_admin or (note.uploader_id == user.id)
