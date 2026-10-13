"""Note report model for student content moderation flags."""
from datetime import datetime, timezone
from app.extensions import db


class NoteReport(db.Model):
    """User-submitted flag on notes for administrative review."""
    __tablename__ = "note_reports"

    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)  # 'pending', 'resolved', 'dismissed'
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    note = db.relationship("Note", back_populates="reports")
    reporter = db.relationship("User", back_populates="reports")

    def __init__(
        self,
        note_id: int | None = None,
        reporter_id: int | None = None,
        reason: str | None = None,
        description: str | None = None,
        status: str = "pending",
        **kwargs,
    ):
        super().__init__()
        if note_id is not None:
            self.note_id = note_id
        if reporter_id is not None:
            self.reporter_id = reporter_id
        if reason is not None:
            self.reason = reason
        if description is not None:
            self.description = description
        self.status = status
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self) -> dict:
        """Serialize report entry for administrator dashboard."""
        return {
            "id": self.id,
            "note_id": self.note_id,
            "reporter_id": self.reporter_id,
            "reason": self.reason,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "note_title": self.note.title if self.note else None,
            "note_subject": self.note.subject if self.note else None,
            "reporter_name": self.reporter.full_name if self.reporter else None,
            "reporter_email": self.reporter.email if self.reporter else None,
        }

    def __repr__(self) -> str:
        return f"<NoteReport id={self.id} note_id={self.note_id} status='{self.status}'>"
