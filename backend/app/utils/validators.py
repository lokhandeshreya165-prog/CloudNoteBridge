"""Input validation and security hygiene for CloudNoteBridge."""
import re
import os
import uuid
from typing import Tuple, Dict, Any, Optional
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
ALLOWED_EXTENSIONS = {"pdf", "ppt", "pptx"}

MIME_TYPE_MAP = {
    "pdf": "application/pdf",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


def validate_registration(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validate student registration payload."""
    if not isinstance(data, dict):
        return False, "Invalid JSON payload."

    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    department = str(data.get("department", "")).strip()
    semester = data.get("semester")

    if not full_name or len(full_name) < 2 or len(full_name) > 100:
        return False, "Full name must be between 2 and 100 characters."

    if not email or not EMAIL_REGEX.match(email):
        return False, "A valid email address is required."

    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long."

    if not department:
        return False, "Academic department is required."

    if semester is None:
        return False, "Semester is required."

    try:
        sem_num = int(semester)
        if sem_num < 1 or sem_num > 10:
            return False, "Semester must be between 1 and 10."
    except (TypeError, ValueError):
        return False, "Semester must be a valid integer."

    return True, None


def validate_login(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validate user login credentials presence."""
    if not isinstance(data, dict):
        return False, "Invalid JSON payload."

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return False, "Both email and password are required."

    return True, None


def validate_file_upload(
    file: FileStorage,
    max_size_bytes: int = 25 * 1024 * 1024,
) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Validate uploaded file against size, extension, and content magic bytes.
    Returns: (is_valid, error_message, file_metadata)
    """
    if not file or not file.filename:
        return False, "No file selected for upload.", None

    original_filename = secure_filename(os.path.basename(file.filename))
    if not original_filename:
        # Fallback if filename was stripped of non-ascii
        original_filename = "document"

    parts = original_filename.rsplit(".", 1)
    if len(parts) < 2:
        return False, "File must have an explicit extension (.pdf, .ppt, .pptx).", None

    ext = parts[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type '.{ext}' is not permitted. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}.", None

    # Check content stream size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size == 0:
        return False, "Uploaded file is empty (0 bytes).", None

    if file_size > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        return False, f"File size exceeds the allowed limit of {max_mb} MB.", None

    # Magic byte inspection
    header = file.read(8)
    file.seek(0)

    if ext == "pdf" and not header.startswith(b"%PDF-"):
        return False, "File header does not match a valid PDF document.", None
    elif ext == "pptx" and not header.startswith(b"PK\x03\x04"):
        return False, "File header does not match a valid PPTX document.", None
    elif ext == "ppt" and not (header.startswith(b"\xD0\xCF\x11\xE0") or header.startswith(b"PK\x03\x04")):
        return False, "File header does not match a valid PPT document.", None

    mime_type = MIME_TYPE_MAP.get(ext, file.content_type or "application/octet-stream")
    unique_id = uuid.uuid4().hex
    generated_filename = f"{unique_id}.{ext}"
    storage_key = f"notes/{generated_filename}"

    file_metadata = {
        "original_filename": original_filename,
        "generated_storage_filename": generated_filename,
        "storage_key": storage_key,
        "file_extension": ext,
        "mime_type": mime_type,
        "file_size": file_size,
    }
    return True, None, file_metadata
