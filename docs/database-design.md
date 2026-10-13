# CloudNoteBridge Database Design

This document describes the relational database schema implemented for **CloudNoteBridge** using MySQL 8.0 and SQLAlchemy ORM.

---

## 1. Entity-Relationship Diagram (Logical)

```
       +-----------------------+
       |         users         |
       +-----------------------+
       | PK  id                |
       |     email (UNIQUE)    |<-----------+
       |     full_name         |            |
       |     password_hash     |            |
       |     department        |            |
       |     semester          |            |
       |     role              |            |
       |     is_active         |            |
       |     created_at        |            |
       |     updated_at        |            |
       +-----------+-----------+            |
                   | 1                      |
                   |                        |
                   | has many               |
                   v *                      |
       +-----------------------+            |
       |         notes         |            |
       +-----------------------+            |
       | PK  id                |            |
       | FK  uploader_id       |            |
       |     title             |            |
       |     description       |            |
       |     subject           |            |
       |     department        |            |
       |     semester          |            |
       |     unit_number       |            |
       |     storage_key (UNQ) |            |
       |     original_filename |            |
       |     generated_filename|            |
       |     file_extension    |            |
       |     mime_type         |            |
       |     file_size         |            |
       |     created_at        |            |
       |     updated_at        |            |
       +---+---------------+---+            |
           | 1             | 1              |
           |               |                |
           v *             v *              |
+---------------------+  +------------------+--+
|  download_history   |  |     note_reports    |
+---------------------+  +---------------------+
| PK  id              |  | PK  id              |
| FK  note_id         |  | FK  note_id         |
| FK  user_id --------+  | FK  reporter_id ----+
|     downloaded_at   |  |     reason          |
+---------------------+  |     description     |
                         |     status          |
                         |     created_at      |
                         +---------------------+
```

---

## 2. Table Specifications

### 2.1 Table: `users`
Stores student and administrator credentials and profiles.

| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(120) | No | UNIQUE, INDEX | College email address |
| `password_hash` | VARCHAR(255) | No | None | PBKDF2/Argon2 hashed password |
| `full_name` | VARCHAR(120) | No | None | Student / Administrator full name |
| `department` | VARCHAR(100) | No | INDEX | Department (e.g. Computer Science) |
| `semester` | INT | No | INDEX | Current semester (1 - 8) |
| `role` | VARCHAR(20) | No | DEFAULT 'student', INDEX | Access level: `student` or `admin` |
| `is_active` | BOOLEAN | No | DEFAULT TRUE | Active account flag |
| `created_at` | DATETIME | No | DEFAULT UTC_TIMESTAMP | Registration timestamp |
| `updated_at` | DATETIME | No | DEFAULT UTC_TIMESTAMP | Last profile modification |

---

### 2.2 Table: `notes`
Stores course document metadata and cloud storage references.

| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PRIMARY KEY | Unique note identifier |
| `uploader_id` | INT | No | FK(`users.id`), INDEX | User who uploaded the note |
| `title` | VARCHAR(200) | No | INDEX | Descriptive title of the note |
| `description` | TEXT | Yes | None | Syllabus topics / unit coverage notes |
| `subject` | VARCHAR(100) | No | INDEX | Course or subject name |
| `department` | VARCHAR(100) | No | INDEX | Academic department |
| `semester` | INT | No | INDEX | Target semester |
| `unit_number` | INT | No | INDEX | Syllabus unit number (e.g., 1 to 6) |
| `storage_key` | VARCHAR(255) | No | UNIQUE, INDEX | S3 object key (`notes/{uuid}.{ext}`) |
| `original_filename`| VARCHAR(255) | No | None | Cleaned original upload filename |
| `generated_storage_filename` | VARCHAR(255) | No | None | Unique filename in storage |
| `file_extension` | VARCHAR(20) | No | INDEX | Lowercase extension (`pdf`, `pptx`) |
| `mime_type` | VARCHAR(100) | No | None | Verified MIME type |
| `file_size` | BIGINT | No | None | File size in bytes |
| `created_at` | DATETIME | No | DEFAULT UTC_TIMESTAMP, INDEX | Timestamp of upload |
| `updated_at` | DATETIME | No | DEFAULT UTC_TIMESTAMP | Last metadata update |

---

### 2.3 Table: `download_history`
Maintains an audit trail of authenticated note downloads.

| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PRIMARY KEY | Unique record ID |
| `user_id` | INT | No | FK(`users.id`), INDEX | User who performed the download |
| `note_id` | INT | No | FK(`notes.id` ON DELETE CASCADE), INDEX | Note downloaded |
| `downloaded_at` | DATETIME | No | DEFAULT UTC_TIMESTAMP, INDEX | Timestamp of download |

---

### 2.4 Table: `note_reports`
Enables students to report inaccurate or inappropriate materials for administrator review.

| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PRIMARY KEY | Unique report ID |
| `note_id` | INT | No | FK(`notes.id` ON DELETE CASCADE), INDEX | Reported note reference |
| `reporter_id` | INT | No | FK(`users.id`), INDEX | Student filing the report |
| `reason` | VARCHAR(100) | No | None | Reason category (e.g., Wrong Syllabus, Copyright) |
| `description` | TEXT | Yes | None | Context provided by student |
| `status` | VARCHAR(20) | No | DEFAULT 'pending', INDEX | Moderation status: `pending`, `resolved`, `dismissed` |
| `created_at` | DATETIME | No | DEFAULT UTC_TIMESTAMP, INDEX | Report submission timestamp |

---

## 3. Data Integrity & Constraints

1. **Foreign Key Deletion**:
   - Deleting a Note cascades to associated `download_history` and `note_reports` rows.
   - Deleting a User is restricted or cleans up owned notes via soft or hard deletion.
2. **Object Key Separation**:
   - S3 object keys are randomized UUID strings (`notes/<uuid4>.<ext>`), preventing object overwrite collisions and directory traversal attempts.
3. **Optimized Search Indexing**:
   - Compound and individual indexes on `(department, semester, subject)` optimize filtering queries across thousands of course notes.
