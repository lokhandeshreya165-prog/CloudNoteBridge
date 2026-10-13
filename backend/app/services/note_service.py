"""Note lifecycle business logic, upload management, and deletion."""
import logging
from typing import Tuple, Optional, Dict, Any, List
from werkzeug.datastructures import FileStorage
from app.extensions import db
from app.models.user import User
from app.models.note import Note
from app.models.download import DownloadHistory
from app.services.storage_service import StorageService
from app.utils.validators import validate_file_upload
from app.utils.permissions import can_manage_note

logger = logging.getLogger(__name__)


class NoteService:
    """Service encapsulating note validation, cloud persistence, and lifecycle operations."""

    @staticmethod
    def create_note(
        user: User,
        form_data: Dict[str, Any],
        file: FileStorage,
        storage_service: StorageService,
        max_size_bytes: int = 25 * 1024 * 1024,
    ) -> Tuple[Optional[Note], Optional[str]]:
        """Validate metadata, upload file to cloud/local storage, and persist DB record."""
        title = str(form_data.get("title", "")).strip()
        description = str(form_data.get("description", "")).strip()
        subject = str(form_data.get("subject", "")).strip()
        department = str(form_data.get("department", "")).strip()
        semester = form_data.get("semester")
        unit_number = form_data.get("unit_number")

        # Validate required metadata
        if not title or len(title) < 2 or len(title) > 200:
            return None, "Title is required and must be between 2 and 200 characters."

        if not subject or len(subject) < 2 or len(subject) > 100:
            return None, "Subject is required and must be between 2 and 100 characters."

        if not department or len(department) < 2 or len(department) > 100:
            return None, "Academic department is required."

        if semester is None:
            return None, "Valid semester number is required."
        try:
            sem_num = int(semester)
            if sem_num < 1 or sem_num > 10:
                return None, "Semester must be an integer between 1 and 10."
        except (TypeError, ValueError):
            return None, "Valid semester number is required."

        if unit_number is None:
            return None, "Valid unit number is required."
        try:
            unit_num = int(unit_number)
            if unit_num < 1 or unit_num > 20:
                return None, "Unit number must be an integer between 1 and 20."
        except (TypeError, ValueError):
            return None, "Valid unit number is required."

        # Validate file
        is_file_valid, file_err, file_meta = validate_file_upload(file, max_size_bytes)
        if not is_file_valid or not file_meta:
            return None, file_err

        storage_key = file_meta["storage_key"]

        # Step 1: Upload to storage provider
        upload_success = storage_service.upload_file(
            file_stream=file.stream,
            storage_key=storage_key,
            mime_type=file_meta["mime_type"],
        )
        if not upload_success:
            return None, "Cloud storage upload failed. Please try again."

        # Step 2: Persist database record with compensating transaction
        note = Note(
            title=title,
            description=description,
            subject=subject,
            department=department,
            semester=sem_num,
            unit_number=unit_num,
            uploader_id=user.id,
            storage_key=storage_key,
            original_filename=file_meta["original_filename"],
            generated_storage_filename=file_meta["generated_storage_filename"],
            file_extension=file_meta["file_extension"],
            mime_type=file_meta["mime_type"],
            file_size=file_meta["file_size"],
        )

        try:
            db.session.add(note)
            db.session.commit()
            logger.info(f"Successfully created Note #{note.id} for user #{user.id}")
            return note, None
        except Exception as exc:
            db.session.rollback()
            logger.error(f"Database error saving Note; executing compensating cleanup of {storage_key}: {exc}")
            # Compensating transaction: remove orphaned cloud object
            storage_service.delete_file(storage_key)
            return None, f"Database error saving note metadata: {str(exc)}"

    @staticmethod
    def delete_note(note: Note, user: User, storage_service: StorageService) -> Tuple[bool, Optional[str]]:
        """Verify ownership and delete both cloud storage object and database record."""
        if not can_manage_note(user, note):
            return False, "You do not have permission to delete this note."

        storage_key = note.storage_key

        try:
            # Delete database record first
            db.session.delete(note)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return False, f"Database error deleting note: {str(exc)}"

        # Clean up cloud object safely
        try:
            storage_service.delete_file(storage_key)
        except Exception as exc:
            logger.warning(f"Could not delete storage object {storage_key} after DB deletion: {exc}")

        return True, None

    @staticmethod
    def record_download(user: User, note: Note) -> None:
        """Create an entry in the download audit log."""
        try:
            download_entry = DownloadHistory(user_id=user.id, note_id=note.id)
            db.session.add(download_entry)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            logger.warning(f"Could not record download history: {exc}")
