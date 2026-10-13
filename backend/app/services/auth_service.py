"""Authentication and user management business logic."""
from typing import Tuple, Optional, Dict, Any
from app.extensions import db
from app.models.user import User
from app.utils.validators import validate_registration, validate_login


class AuthService:
    """Service handling user account registration, authentication, and profile updates."""

    @staticmethod
    def register_user(data: Dict[str, Any]) -> Tuple[Optional[User], Optional[str]]:
        """Validate input, ensure unique email, hash password, and persist user."""
        is_valid, error = validate_registration(data)
        if not is_valid:
            return None, error

        email = data["email"].strip().lower()
        if User.query.filter_by(email=email).first():
            return None, "An account with this email address already exists."

        user = User(
            full_name=data["full_name"].strip(),
            email=email,
            department=data["department"].strip(),
            semester=int(data["semester"]),
            role="student",
            is_active=True,
        )
        user.set_password(data["password"])

        try:
            db.session.add(user)
            db.session.commit()
            return user, None
        except Exception as exc:
            db.session.rollback()
            return None, f"Database error during registration: {str(exc)}"

    @staticmethod
    def authenticate_user(data: Dict[str, Any]) -> Tuple[Optional[User], Optional[str]]:
        """Verify user credentials and return authenticated User record."""
        is_valid, error = validate_login(data)
        if not is_valid:
            return None, error

        email = data["email"].strip().lower()
        password = data["password"]

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return None, "Invalid email address or password."

        if not user.is_active:
            return None, "Account is disabled. Please contact an administrator."

        return user, None

    @staticmethod
    def update_profile(user: User, data: Dict[str, Any]) -> Tuple[Optional[User], Optional[str]]:
        """Update approved student profile fields without privilege escalation."""
        if not user:
            return None, "User not found."

        if "full_name" in data:
            val = str(data["full_name"]).strip()
            if len(val) < 2 or len(val) > 100:
                return None, "Full name must be between 2 and 100 characters."
            user.full_name = val

        if "department" in data:
            val = str(data["department"]).strip()
            if not val:
                return None, "Department cannot be empty."
            user.department = val

        if "semester" in data:
            try:
                sem = int(data["semester"])
                if sem < 1 or sem > 10:
                    return None, "Semester must be between 1 and 10."
                user.semester = sem
            except (ValueError, TypeError):
                return None, "Invalid semester value."

        try:
            db.session.commit()
            return user, None
        except Exception as exc:
            db.session.rollback()
            return None, f"Database error updating profile: {str(exc)}"
