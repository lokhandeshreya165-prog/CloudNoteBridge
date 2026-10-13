# CloudNoteBridge System Architecture

CloudNoteBridge is a full-stack, cloud-enabled academic note-sharing application engineered for college students and faculty. It centralizes course documents (lecture notes, unit summaries, syllabus coverage, presentation slides) and organizes them by department, semester, subject, and unit.

---

## 1. High-Level Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + React Router        |
|  (Responsive UI: Desktop, Tablet, Mobile / Accessible Forms / Toast Notifications)|
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JSON) + File Uploads (Multipart)
                                           v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION LAYER                                 |
|                               Python 3 Flask Backend                              |
|                                                                                   |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  | Blueprints/Routes |  |  Core Services    |  |  Security & Middleware        |  |
|  | - Auth            |  |  - AuthService    |  |  - Argon2/PBKDF2 Password Hash|  |
|  | - Notes           |  |  - NoteService    |  |  - HttpOnly Cookie Sessions   |  |
|  | - Downloads       |  |  - StorageService |  |  - Role-Based Access Control  |  |
|  | - Profile         |  |  - SearchService  |  |  - Filename Sanitization      |  |
|  | - Admin & Health  |  |  - ReportService  |  |  - File Type / Size Validator |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
+---------------------+-------------------------------------+-----------------------+
                      |                                     |
                      v                                     v
+--------------------------------------+   +----------------------------------------+
|            DATA STORAGE              |   |             OBJECT STORAGE             |
|          MySQL 8.0 Relational        |   |       Amazon Simple Storage Service    |
|               Database               |   |                  (AWS S3)              |
|                                      |   |                                        |
|  - Users (Students & Admins)         |   |  - Private S3 Bucket                   |
|  - Notes (Metadata, Unit, Subject)   |   |  - Server-Side Encryption (AES-256)    |
|  - Download History (Audit logs)     |   |  - Short-Lived Pre-Signed URLs         |
|  - Note Reports (Moderation queue)   |   |  - Pluggable Local Dev Storage         |
+--------------------------------------+   +----------------------------------------+
```

---

## 2. Component Responsibilities

### 2.1 Frontend Client
- **Single Page Application (SPA)** built with React 19, TypeScript, and Vite.
- **Styling**: Tailwind CSS for a modern, crisp academic SaaS design language with clear contrast, subtle shadows, and responsive layout.
- **Client Routing**: React Router v7 with protected route wrappers (`ProtectedRoute`, `AdminRoute`).
- **State & Context**: `AuthContext` provides centralized authentication status, active user profile, and session management.
- **Feedback & Usability**: Reusable modal dialogs, loading skeletons, error banners, search filters, and download progress states.

### 2.2 Backend Application
- **Application Factory Pattern**: `create_app()` initializes configuration, database ORM, CORS policies, blueprints, and CLI commands.
- **Modular Blueprints**:
  - `auth_bp`: Registration, login, logout, current session inspection (`/api/auth/me`).
  - `notes_bp`: Listing, search, filtering, detail retrieval, upload, and deletion.
  - `downloads_bp`: Secure, short-lived download ticket generation and local file streaming.
  - `profile_bp`: Viewing and updating student academic profile.
  - `admin_bp`: User directory, system-wide note moderation, report management, and audit inspection.
  - `health_bp`: Health check endpoint testing database connectivity and cloud storage readiness.
- **Storage Abstraction Layer**:
  - `StorageService` interface decoupling routes from concrete cloud vendors.
  - `S3StorageService`: Interacts with AWS S3 using `boto3`, generates pre-signed URLs, enforces private access.
  - `LocalDevelopmentStorageService`: Allows offline development and automated test execution without AWS billing.

### 2.3 Relational Database (MySQL)
- Enforces relational integrity, foreign key cascades, and unique constraints.
- Indexed columns on `email`, `subject`, `department`, `semester`, `unit_number`, and `storage_key` ensure fast search queries.
- Raw file binary streams are **never stored** in the database; only sanitized metadata, MIME types, file sizes, and storage identifiers.

### 2.4 Cloud Storage (AWS S3)
- **Bucket Privacy**: Block Public Access enabled; no public read permissions.
- **Access Patterns**:
  - Uploads are sent through the authenticated Flask backend, which validates magic bytes, extensions, and file sizes before uploading to S3 with randomized UUID keys.
  - Downloads are initiated through authorized backend requests that generate time-limited pre-signed download URLs (default expiration: 3600 seconds).

---

## 3. Data Flow Workflows

### 3.1 Note Upload Workflow
1. The student navigates to `/upload` and selects a document (PDF, PPT, or PPTX).
2. The frontend validates the extension and client-side file size before submission.
3. The multipart form data is transmitted with session credentials to `POST /api/notes`.
4. The backend verifies the student's authenticated session.
5. `validators.py` verifies:
   - Metadata presence (title, subject, department, semester, unit).
   - Configurable file-size limit (default: 25 MB).
   - Allowed MIME types and file extensions (`pdf`, `ppt`, `pptx`).
6. A cryptographically unique object key is generated: `notes/{uuid4}.{ext}`.
7. `StorageService.upload_file()` pushes the binary to AWS S3 (or local dev storage if AWS is unconfigured).
8. The database transaction inserts a `Note` record linked to the `uploader_id`.
9. If the database insertion fails, a compensating cleanup deletes the orphaned S3 object.
10. A `201 Created` response returns the note metadata to the client.

### 3.2 Secure Note Download Workflow
1. An authenticated student clicks **Download** on a note card or details page.
2. The client sends a request to `GET /api/notes/{id}/download`.
3. The backend checks authentication and retrieves the note record from MySQL.
4. If valid, the backend logs a record in `DownloadHistory` for academic audit tracking.
5. The storage service generates a short-lived Pre-Signed S3 URL containing the sanitized `Content-Disposition: attachment; filename="{original_filename}"` header (or a signed local stream URL in local development mode).
6. The client receives `{ download_url, storage_mode, expires_in }` and initiates the browser download.
