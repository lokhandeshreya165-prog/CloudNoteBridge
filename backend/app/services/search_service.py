"""Search and filtering service for course notes."""
from typing import Dict, Any
from sqlalchemy import or_, desc, asc
from app.models.note import Note


class SearchService:
    """Service providing parameterized filtering, sorting, and pagination for notes."""

    @staticmethod
    def search_notes(params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Query notes with dynamic filters, safe parameterized conditions, and pagination.
        """
        query = Note.query

        # Free text search across title, subject, and description
        search_term = params.get("q", "").strip()
        if search_term:
            like_pattern = f"%{search_term}%"
            query = query.filter(
                or_(
                    Note.title.ilike(like_pattern),
                    Note.subject.ilike(like_pattern),
                    Note.description.ilike(like_pattern),
                )
            )

        # Department filter
        dept = params.get("department", "").strip()
        if dept:
            query = query.filter(Note.department == dept)

        # Subject filter
        subj = params.get("subject", "").strip()
        if subj:
            query = query.filter(Note.subject.ilike(f"%{subj}%"))

        # Semester filter
        sem = params.get("semester")
        if sem:
            try:
                sem_int = int(sem)
                query = query.filter(Note.semester == sem_int)
            except (ValueError, TypeError):
                pass

        # Unit number filter
        unit = params.get("unit")
        if unit:
            try:
                unit_int = int(unit)
                query = query.filter(Note.unit_number == unit_int)
            except (ValueError, TypeError):
                pass

        # File type filter (pdf, ppt, pptx)
        file_type = params.get("file_type", "").strip().lower()
        if file_type:
            query = query.filter(Note.file_extension == file_type)

        # Uploader filter (for My Uploads page)
        uploader_id = params.get("uploader_id")
        if uploader_id:
            try:
                query = query.filter(Note.uploader_id == int(uploader_id))
            except (ValueError, TypeError):
                pass

        # Sorting
        sort_by = params.get("sort_by", "newest").lower()
        order = params.get("order", "desc").lower()

        if sort_by == "title":
            query = query.order_by(Note.title.asc() if order == "asc" else Note.title.desc())
        elif sort_by == "semester":
            query = query.order_by(Note.semester.asc() if order == "asc" else Note.semester.desc())
        elif sort_by == "unit":
            query = query.order_by(Note.unit_number.asc() if order == "asc" else Note.unit_number.desc())
        else:  # newest / created_at default
            query = query.order_by(Note.created_at.asc() if order == "asc" else Note.created_at.desc())

        # Pagination
        try:
            page = max(1, int(params.get("page", 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            per_page = min(50, max(1, int(params.get("per_page", 12))))
        except (ValueError, TypeError):
            per_page = 12

        total = query.count()
        notes = query.offset((page - 1) * per_page).limit(per_page).all()
        total_pages = (total + per_page - 1) // per_page if total > 0 else 1

        return {
            "notes": [note.to_dict() for note in notes],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
