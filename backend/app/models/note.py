"""Note model representing course notes and uploaded academic documents."""
from datetime import datetime, timezone
from app.extensions import db


class Note(db.Model):
    """Academic note metadata linked to AWS S3 or local development storage."""
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    subject = db.Column(db.String(100), nullable=False, index=True)
    department = db.Column(db.String(100), nullable=False, index=True)
    semester = db.Column(db.Integer, nullable=False, index=True)
    unit_number = db.Column(db.Integer, nullable=False, index=True)

    uploader_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Cloud & File details
    storage_key = db.Column(db.String(255), unique=True, nullable=False, index=True)
    original_filename = db.Column(db.String(255), nullable=False)
    generated_storage_filename = db.Column(db.String(255), nullable=False)
    file_extension = db.Column(db.String(20), nullable=False, index=True)
    mime_type = db.Column(db.String(100), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    uploader = db.relationship("User", back_populates="notes")
    downloads = db.relationship(
        "DownloadHistory",
        back_populates="note",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    reports = db.relationship(
        "NoteReport",
        back_populates="note",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def __init__(
        self,
        title: str | None = None,
        description: str | None = None,
        subject: str | None = None,
        department: str | None = None,
        semester: int | None = None,
        unit_number: int | None = None,
        uploader_id: int | None = None,
        storage_key: str | None = None,
        original_filename: str | None = None,
        generated_storage_filename: str | None = None,
        file_extension: str | None = None,
        mime_type: str | None = None,
        file_size: int | None = None,
        **kwargs,
    ):
        super().__init__()
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if subject is not None:
            self.subject = subject
        if department is not None:
            self.department = department
        if semester is not None:
            self.semester = semester
        if unit_number is not None:
            self.unit_number = unit_number
        if uploader_id is not None:
            self.uploader_id = uploader_id
        if storage_key is not None:
            self.storage_key = storage_key
        if original_filename is not None:
            self.original_filename = original_filename
        if generated_storage_filename is not None:
            self.generated_storage_filename = generated_storage_filename
        if file_extension is not None:
            self.file_extension = file_extension
        if mime_type is not None:
            self.mime_type = mime_type
        if file_size is not None:
            self.file_size = file_size
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self, include_uploader: bool = True) -> dict:
        """Serialize note metadata for frontend API responses."""
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "subject": self.subject,
            "department": self.department,
            "semester": self.semester,
            "unit_number": self.unit_number,
            "uploader_id": self.uploader_id,
            "storage_key": self.storage_key,
            "original_filename": self.original_filename,
            "file_extension": self.file_extension,
            "mime_type": self.mime_type,
            "file_size": self.file_size,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "download_count": self.downloads.count() if hasattr(self, "downloads") else 0,
        }
        if include_uploader and self.uploader:
            data["uploader_name"] = self.uploader.full_name
            data["uploader_department"] = self.uploader.department
        return data

    def __repr__(self) -> str:
        return f"<Note id={self.id} title='{self.title}' subject='{self.subject}' unit={self.unit_number}>"
