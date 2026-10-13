# CloudNoteBridge REST API Documentation

This document describes all API endpoints implemented in the Flask backend for **CloudNoteBridge**.

All endpoints use the `/api` prefix. Standard response bodies follow consistent JSON formatting:
```json
{
  "success": true,
  "data_or_resource": {},
  "message": "Optional status message"
}
```
Error responses adhere to:
```json
{
  "success": false,
  "error": "Human-readable explanation of error.",
  "code": "OPTIONAL_ERROR_CODE"
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 `POST /api/auth/register`
Registers a new student account and automatically initializes an authenticated session.

**Request Body (`application/json`):**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@college.edu",
  "password": "Password123!",
  "department": "Computer Science & Engineering",
  "semester": 5
}
```

**Responses:**
- `201 Created`:
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "user": {
      "id": 1,
      "full_name": "Jane Doe",
      "email": "jane@college.edu",
      "department": "Computer Science & Engineering",
      "semester": 5,
      "role": "student",
      "is_active": true,
      "created_at": "2026-10-13T16:00:00Z"
    }
  }
  ```
- `400 Bad Request`: Validation failure (short password, invalid email format, duplicate email).

---

### 1.2 `POST /api/auth/login`
Authenticates student or administrator credentials and sets an `HttpOnly`, `SameSite=Lax` session cookie.

**Request Body (`application/json`):**
```json
{
  "email": "jane@college.edu",
  "password": "Password123!"
}
```

**Responses:**
- `200 OK`:
  ```json
  {
    "success": true,
    "message": "Welcome back, Jane Doe!",
    "user": { ... }
  }
  ```
- `401 Unauthorized`: Invalid credentials or deactivated account.

---

### 1.3 `POST /api/auth/logout`
Terminates the active user session and clears the session cookie.

**Responses:**
- `200 OK`:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

---

### 1.4 `GET /api/auth/me`
Inspects the active session and returns the current user profile, or `null` if unauthenticated.

**Responses:**
- `200 OK`:
  ```json
  {
    "success": true,
    "user": { ... } // or null
  }
  ```

---

## 2. Course Notes Endpoints (`/api/notes`)

### 2.1 `GET /api/notes`
Queries course notes with parameterized filters, keyword search, sorting, and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | string | `""` | Search term matching title, subject, or description |
| `department` | string | `""` | Filter by academic department |
| `subject` | string | `""` | Filter by course or subject |
| `semester` | integer | `""` | Filter by semester (1–8) |
| `unit` | integer | `""` | Filter by syllabus unit number (1–6) |
| `file_type` | string | `""` | Filter by extension (`pdf`, `pptx`, `ppt`) |
| `sort_by` | string | `"newest"` | `"newest"`, `"title"`, `"semester"`, `"unit"` |
| `order` | string | `"desc"` | `"desc"` or `"asc"` |
| `page` | integer | `1` | Page number |
| `per_page` | integer | `12` | Results per page (max 50) |

**Responses:**
- `200 OK`:
  ```json
  {
    "success": true,
    "notes": [
      {
        "id": 1,
        "title": "Unit 1: Relational Database Models & Normalization",
        "description": "Functional dependencies and 3NF normalization notes.",
        "subject": "Database Management Systems",
        "department": "Computer Science & Engineering",
        "semester": 5,
        "unit_number": 1,
        "uploader_id": 1,
        "uploader_name": "Jane Doe",
        "storage_key": "notes/uuid.pdf",
        "original_filename": "DBMS_Unit1.pdf",
        "file_extension": "pdf",
        "mime_type": "application/pdf",
        "file_size": 2450000,
        "download_count": 4,
        "created_at": "2026-10-13T16:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "per_page": 12,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
  ```

---

### 2.2 `GET /api/notes/{id}`
Retrieves detailed metadata for a specific note.

**Responses:**
- `200 OK`: `{ "success": true, "note": { ... } }`
- `404 Not Found`: Note does not exist.

---

### 2.3 `POST /api/notes`
Uploads a course note document and stores its metadata. Requires active student login.

**Request Header:** `Content-Type: multipart/form-data`
**Form Fields:**
- `title` (string, required): Note title (2–200 characters)
- `description` (string, optional): Syllabus coverage summary
- `subject` (string, required): Course subject name
- `department` (string, required): Academic department
- `semester` (integer, required): Target semester (1–8)
- `unit_number` (integer, required): Syllabus unit number (1–6)
- `file` (file binary, required): Document in `.pdf`, `.ppt`, or `.pptx` format (max 25 MB)

**Responses:**
- `201 Created`:
  ```json
  {
    "success": true,
    "message": "Note uploaded successfully.",
    "note": { ... },
    "storage_mode": "aws_s3" // or "local_storage"
  }
  ```
- `400 Bad Request`: Missing field, unsupported file extension, corrupted magic bytes, or file exceeds size limit.
- `401 Unauthorized`: User is not authenticated.

---

### 2.4 `DELETE /api/notes/{id}`
Deletes a course note from both the database and cloud storage. Permitted only if the caller owns the note or is an administrator.

**Responses:**
- `200 OK`: `{ "success": true, "message": "Note deleted successfully." }`
- `403 Forbidden`: User is neither the uploader nor an administrator.
- `404 Not Found`: Note does not exist.

---

### 2.5 `GET /api/my-notes`
Returns course notes uploaded by the currently authenticated student. Supports all query parameters available in `/api/notes`.

---

### 2.6 `POST /api/notes/{id}/report`
Submits a moderation flag on a note for administrator review.

**Request Body (`application/json`):**
```json
{
  "reason": "Outdated Content",
  "description": "The course textbook and syllabus were revised in 2024."
}
```

**Responses:**
- `201 Created`: `{ "success": true, "message": "Report submitted for review..." }`
- `404 Not Found`: Note does not exist.

---

## 3. Authorized Download Endpoints (`/api/notes/{id}/download`)

### 3.1 `GET /api/notes/{id}/download`
Authenticates student, records an entry in `DownloadHistory`, and generates a short-lived download URL.

**Responses:**
- `200 OK`:
  ```json
  {
    "success": true,
    "download_url": "https://s3.amazonaws.com/your-bucket/notes/uuid.pdf?AWSAccessKeyId=...&Expires=...",
    "original_filename": "DBMS_Unit1.pdf",
    "file_size": 2450000,
    "mime_type": "application/pdf",
    "storage_mode": "aws_s3",
    "expires_in_seconds": 3600
  }
  ```
- `401 Unauthorized`: Caller is not logged in.
- `404 Not Found`: Note or underlying cloud object does not exist.

---

### 3.2 `GET /api/downloads/local/{storage_key}`
Streams local files as attachments for offline/development mode. Path traversal is strictly blocked.

---

## 4. Student Profile Endpoints (`/api/profile`)

### 4.1 `GET /api/profile`
Returns active student profile and metrics:
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "full_name": "Jane Doe",
    "email": "jane@college.edu",
    "department": "Computer Science & Engineering",
    "semester": 5,
    "role": "student",
    "stats": {
      "uploads_count": 3,
      "total_downloads_received": 14
    }
  }
}
```

### 4.2 `PATCH /api/profile`
Updates approved profile fields (`full_name`, `department`, `semester`). Role escalation is prohibited.

---

## 5. Administrator Governance Endpoints (`/api/admin`)

*All `/api/admin/*` endpoints require `role === 'admin'`; unauthorized students receive `403 Forbidden`.*

- `GET /api/admin/stats`: Returns system counts (total users, notes, downloads, pending reports, active storage provider).
- `GET /api/admin/users`: Lists registered student accounts with search and pagination.
- `GET /api/admin/notes`: Lists all notes across departments for administrative inspection.
- `DELETE /api/admin/notes/{id}`: Administrator deletes an inappropriate note.
- `GET /api/admin/reports`: Lists reported notes with status filter (`pending`, `resolved`, `dismissed`).
- `PATCH /api/admin/reports/{id}`: Updates report status.

---

## 6. System Health (`/api/health`)

### `GET /api/health`
Checks database connectivity and reports storage configuration.
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "error": null
  },
  "storage": {
    "provider": "aws_s3",
    "is_aws_s3": true
  },
  "timestamp": "2026-10-13T16:00:00Z"
}
```
