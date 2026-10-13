"""User model for students and administrators."""
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model):
    """User representation with secure password hashing and role-based permissions."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(100), nullable=False, index=True)
    semester = db.Column(db.Integer, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default="student", index=True)  # 'student' or 'admin'
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    notes = db.relationship("Note", back_populates="uploader", cascade="all, delete-orphan", lazy="dynamic")
    downloads = db.relationship("DownloadHistory", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")
    reports = db.relationship("NoteReport", back_populates="reporter", cascade="all, delete-orphan", lazy="dynamic")

    def __init__(
        self,
        full_name: str | None = None,
        email: str | None = None,
        password_hash: str | None = None,
        department: str | None = None,
        semester: int | None = None,
        role: str = "student",
        is_active: bool = True,
        **kwargs,
    ):
        super().__init__()
        if full_name is not None:
            self.full_name = full_name
        if email is not None:
            self.email = email
        if password_hash is not None:
            self.password_hash = password_hash
        if department is not None:
            self.department = department
        if semester is not None:
            self.semester = semester
        self.role = role
        self.is_active = is_active
        for k, v in kwargs.items():
            setattr(self, k, v)

    def set_password(self, password: str) -> None:
        """Hash and store a secure representation of the user password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify the candidate password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self) -> bool:
        """Check if user possesses administrator authorization."""
        return self.role == "admin"

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Serialize user model to dictionary."""
        data = {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "department": self.department,
            "semester": self.semester,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        return data

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}' role='{self.role}'>"
