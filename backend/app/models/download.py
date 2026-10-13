"""Download history tracking model for audit logs."""
from datetime import datetime, timezone
from app.extensions import db


class DownloadHistory(db.Model):
    """Tracks note download events by authenticated users."""
    __tablename__ = "download_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    note_id = db.Column(db.Integer, db.ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    downloaded_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = db.relationship("User", back_populates="downloads")
    note = db.relationship("Note", back_populates="downloads")

    def __init__(
        self,
        user_id: int | None = None,
        note_id: int | None = None,
        **kwargs,
    ):
        super().__init__()
        if user_id is not None:
            self.user_id = user_id
        if note_id is not None:
            self.note_id = note_id
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self) -> dict:
        """Serialize download history entry."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "note_id": self.note_id,
            "downloaded_at": self.downloaded_at.isoformat() if self.downloaded_at else None,
            "note_title": self.note.title if self.note else None,
            "note_subject": self.note.subject if self.note else None,
            "user_name": self.user.full_name if self.user else None,
        }

    def __repr__(self) -> str:
        return f"<DownloadHistory id={self.id} user_id={self.user_id} note_id={self.note_id}>"
