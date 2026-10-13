# CloudNoteBridge Quality Assurance & Testing Guide

This guide describes how to run automated tests, perform end-to-end integration checks, and conduct manual user-acceptance testing on **CloudNoteBridge**.

---

## 1. Automated Test Suite (Pytest)

The backend features an isolated, automated test suite that tests authentication, validation, authorization, note operations, and cloud storage mocks without requiring live AWS credentials or a running MySQL instance (uses SQLite `:memory:`).

### 1.1 Running the Backend Tests
From the project root:
```bash
cd backend
.venv\Scripts\pytest.exe -v
```
*(On Linux/macOS: `.venv/bin/pytest -v`)*

### 1.2 Test Modules Overview
| Test Module | Coverage Summary |
|---|---|
| `tests/test_auth.py` | Student registration, password length validation, duplicate email rejection, login verification, session expiration, and `/api/auth/me`. |
| `tests/test_notes.py` | Valid PDF uploads, rejection of `.exe` and unsupported extensions, magic byte validation, search by keyword, multi-filtering, ownership enforcement on deletion, and download flow. |
| `tests/test_storage.py` | Local development storage lifecycle, path traversal attack prevention (`../` rejection), and AWS `S3StorageService` unit test with mocked `boto3`. |
| `tests/test_admin.py` | Student access prevention (`403 Forbidden` on admin routes), administrator stats, user directory, report status updates, and administrative note removal. |

---

## 2. Frontend Build Verification

To verify that all TypeScript types, React components, and Vite bundles build with zero errors:
```bash
cd frontend
npm run build
```
This runs `tsc -b` and `vite build`, producing optimized static assets in `frontend/dist`.

---

## 3. Manual Testing & Verification Workflow

### Test Flow 1: Student Registration & Auto-Login
1. Open `http://localhost:5173`.
2. Click **Get Started** in the top navigation.
3. Fill in student details:
   - Name: `Sarah Connor`
   - Email: `sarah@college.edu`
   - Department: `Computer Science & Engineering`
   - Semester: `4`
   - Password: `Password123!`
4. Click **Create Account**.
5. **Expected Outcome**: Account is registered, an authenticated cookie is issued, and you are automatically redirected to `/dashboard`.

---

### Test Flow 2: Note Upload & Validation
1. From the dashboard or top navbar, click **Upload Note**.
2. Fill in course metadata:
   - Title: `Unit 2: B-Trees and Query Parsing`
   - Subject: `Database Management Systems`
   - Department: `Computer Science & Engineering`
   - Semester: `5`
   - Unit: `2`
3. Drag and drop or choose a valid `.pdf` or `.pptx` file.
4. Click **Upload Note**.
5. **Expected Outcome**: A success banner appears with a button to view note details or navigate to explore.

---

### Test Flow 3: Security & Rejection Testing
1. Attempt uploading a file with a `.exe` or `.py` extension.
   - **Expected Outcome**: Client-side and server-side validation immediately reject the file with a helpful error message.
2. Attempt uploading an empty file (0 bytes).
   - **Expected Outcome**: Backend rejects the upload.
3. Attempt modifying a file extension to `.pdf` while containing plain text.
   - **Expected Outcome**: Magic-byte inspection detects invalid PDF headers and blocks the upload.

---

### Test Flow 4: Filter & Search Verification
1. Navigate to **Explore Notes** (`/explore`).
2. Type a subject keyword (e.g. `Database`) into the search bar and press Search.
3. Apply filters:
   - Select **Semester 5**
   - Select **Unit 2**
4. **Expected Outcome**: The notes grid dynamically updates with matching records.

---

### Test Flow 5: Authorized Download
1. Click **Download** on any note card.
2. **Expected Outcome**: The browser initiates the download with the original file name, while an entry is recorded in the `download_history` audit table.

---

### Test Flow 6: Document Ownership & Deletion
1. Navigate to **My Uploads** (`/my-uploads`).
2. Locate a note you uploaded and click **Delete**.
3. Confirm the browser dialog.
4. **Expected Outcome**: The record is removed from MySQL and the corresponding file is deleted from storage.

---

### Test Flow 7: Content Reporting & Admin Moderation
1. Open a note details page (`/notes/:id`).
2. Click **Report** and submit a reason (e.g., `Outdated Content`).
3. Log out and log in with an administrator account (created via `python -m flask create-admin`).
4. Navigate to **Admin Panel** (`/admin`).
5. Open the **Reported Notes Queue** tab.
6. Verify the reported note appears; click **Resolve** or **Remove Note**.
