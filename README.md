# CloudNoteBridge — Cloud-Based Student Note Sharing Application

CloudNoteBridge is a full-stack, cloud-enabled web application developed for college students to upload, organize, discover, view, and download academic course notes and presentation slides. Built with a modern academic SaaS aesthetic, the platform centralizes materials that are traditionally scattered across chat groups and personal drives, organizing them systematically by department, semester, subject, and unit.

---

## 1. Problem Statement & Objectives

### The Problem
In most colleges and universities, study materials, lecture summaries, and presentation slides are distributed haphazardly through WhatsApp groups, unindexed Telegram channels, personal email threads, and fragmented cloud links. Students face critical challenges:
- Difficulty locating specific notes before semester exams.
- Broken download links and lost attachments.
- Lack of syllabus alignment (unclear which unit or module a document belongs to).
- Inefficient search and redundant requests to classmates.

### Objectives
1. **Centralized Platform**: Provide a single, reliable hub for college course materials.
2. **Syllabus-Aligned Organization**: Organize notes strictly by Department, Semester (1–8), Subject, and Unit (1–6).
3. **Cloud-Backed Storage**: Demonstrate real cloud architecture with Amazon Web Services (AWS S3) and secure pre-signed download URLs.
4. **Relational Integrity**: Maintain structured user accounts, note metadata, and download audit logs in a relational MySQL database.
5. **Secure Collaboration**: Enforce role-based access control, strict ownership boundaries, server-side document validation, and content moderation.

---

## 2. Technology Stack

### Frontend Client
- **React 19** with **TypeScript** for type safety and robust component state.
- **Vite 8** for fast bundling and development HMR.
- **Tailwind CSS** for modern academic SaaS typography, responsive layouts, and consistent tokens.
- **Lucide React** for clean, scalable interface icons.
- **React Router v7** for declarative client-side routing and protected routes.

### Backend Application
- **Python 3** with **Flask** implementing the **Application Factory Pattern**.
- **Flask Blueprints** for modular API separation (`auth`, `notes`, `downloads`, `profile`, `admin`, `health`).
- **SQLAlchemy ORM** for parameterized database queries, indexes, and transactions.
- **Flask-CORS** configured with explicit trusted origins.
- **Secure Sessions**: Signed `HttpOnly` and `SameSite=Lax` cookies.
- **PBKDF2 / Argon2** password hashing via Werkzeug.

### Relational Database
- **MySQL 8.0** (with PyMySQL driver and cryptography support).
- Fallback support for SQLite in isolated automated tests and initial local test runs.
- Foreign key constraints, indexing on search terms, and cascading deletions.

### Cloud Object Storage
- **Amazon Web Services (AWS S3)** via `boto3`.
- **Private S3 Bucket**: Block Public Access enabled; server-side encryption (AES256).
- **Pre-signed URLs**: Generates time-limited, signed download URLs (default expiration: 3600s).
- **Pluggable Storage Abstraction**: Clean `StorageService` interface featuring `S3StorageService` for cloud deployment and `LocalDevelopmentStorageService` for offline development.

---

## 3. System Architecture & Component Responsibilities

```
                               +-------------------------------------+
                               |         CLIENT FRONTEND             |
                               |    React 19 + TypeScript + Vite     |
                               +------------------+------------------+
                                                  |
                                                  | REST API (JSON / Multipart)
                                                  v
                               +-------------------------------------+
                               |         FLASK BACKEND API           |
                               |       Application Factory           |
                               |  Blueprints: auth, notes, admin     |
                               |  Services: Storage, Auth, Search    |
                               +---------+-----------------+---------+
                                         |                 |
                SQLAlchemy Queries (ORM) |                 | Boto3 SDK (Presigned URLs)
                                         v                 v
               +---------------------------+     +---------------------------+
               |     DATABASE LAYER        |     |      STORAGE LAYER        |
               |       MySQL 8.0           |     |     Amazon S3 Bucket      |
               |  Users, Notes, Downloads  |     |   (Encrypted / Private)   |
               +---------------------------+     +---------------------------+
```

| Layer | Responsibility |
|---|---|
| **Frontend** | Renders responsive UI, handles client routing, form validation, download triggers, and session state. |
| **Backend** | Enforces authentication, magic-byte document validation, business logic, authorization, and error handling. |
| **MySQL** | Stores user credentials, course metadata (department, semester, unit), and download audit records. |
| **AWS S3** | Stores the actual binary documents (PDF, PPTX) in a private encrypted bucket accessed via pre-signed tickets. |

---

## 4. Project Structure

```
CloudNoteBridge/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask Application Factory & CLI commands
│   │   ├── config.py            # Environment-driven configuration classes
│   │   ├── extensions.py        # SQLAlchemy & CORS extensions
│   │   ├── models/              # Relational models (User, Note, Download, Report)
│   │   ├── routes/              # Modular Blueprints (auth, notes, downloads, profile, admin, health)
│   │   ├── services/            # StorageService (S3 & Local), AuthService, NoteService, SearchService
│   │   └── utils/               # Validators (magic bytes, extensions), permissions, errors
│   ├── tests/                   # Pytest test suite (17 automated tests)
│   ├── .env.example             # Backend configuration template
│   ├── pytest.ini               # Pytest configuration
│   ├── requirements.txt         # Pinned Python dependencies
│   └── run.py                   # Development server entry point
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, NoteCard, ProtectedRoute, LoadingSpinner, EmptyState
│   │   ├── context/             # AuthContext (session state, user profile, cloud health)
│   │   ├── pages/               # Landing, Login, Register, Dashboard, Explore, Upload, Details, MyUploads, Admin, Profile
│   │   ├── services/            # API client service
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # React Router setup
│   │   ├── index.css            # Tailwind CSS design system tokens
│   │   └── main.tsx             # React DOM root
│   ├── .env.example             # Frontend environment configuration template
│   ├── package.json             # NPM dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite configuration with API proxy
├── docs/
│   ├── architecture.md          # Comprehensive architectural design & data flows
│   ├── database-design.md       # Relational tables, fields, constraints, and indexes
│   ├── api-documentation.md     # Complete REST API specifications & request/response samples
│   ├── aws-setup.md             # AWS S3 bucket provisioning, IAM least-privilege policy, and security
│   └── testing-guide.md         # Automated and manual quality assurance instructions
├── .gitignore                   # Excludes secrets (.env), venv, node_modules, and uploads
└── README.md                    # Project overview and setup instructions
```

---

## 5. Local Setup & Installation

### Prerequisites
- **Python**: 3.10+ (Tested with Python 3.14)
- **Node.js**: v18+ (Tested with Node.js v24) & npm
- **MySQL Server**: 8.0 (or SQLite for quick zero-configuration testing)

---

### Step 1: Clone and Open Repository
```bash
cd Desktop/CloudNoteBridge
```

---

### Step 2: Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   ```
   - On Windows (PowerShell):
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - On Linux/macOS:
     ```bash
     source .venv/bin/activate
     ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to configure your MySQL credentials or AWS S3 credentials. If you do not have AWS S3 credentials yet, leave them blank—the application will automatically use the built-in local development storage adapter!

4. Initialize database and seed sample course notes:
   ```bash
   python -m flask --app app:create_app init-db
   python -m flask --app app:create_app seed-data
   ```
   *(Optional) To create an initial administrator account:*
   ```bash
   python -m flask --app app:create_app create-admin
   ```

5. Start the Flask backend server:
   ```bash
   python run.py
   ```
   The backend will start at `http://127.0.0.1:5000`.

---

### Step 3: Frontend Setup
1. In a new terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be live at `http://localhost:5173`.

---

## 6. Demo Accounts (For Grading & Testing)

| Role | Email | Password | Details |
|---|---|---|---|
| **Student (Demo)** | `student@college.edu` | `StudentPass123!` | Has 5 seeded course notes. Supports one-click "Auto Fill" on the Login page. |
| **Admin** | Created via CLI | Configured via prompt | Access to `/admin` moderation queue, user directory, and stats. |

---

## 7. Running Automated Tests

Run the backend test suite:
```bash
cd backend
.venv\Scripts\pytest.exe -v
```
**Test Results**: All 17 automated tests verify registration, duplicate protection, password hashing, valid and invalid file uploads, search filters, document ownership, cloud storage adapter, and administrator authorization boundaries.

Run frontend type checking and production build:
```bash
cd frontend
npm run build
```

---

## 8. Production AWS Deployment & S3 Storage

### Deployment Options
- **1-Click CloudFormation Stack**: Provision EC2, S3 bucket, IAM role, and auto-deploy in 5 minutes using `deploy/aws/cloudformation-template.yaml`.
- **Automated EC2 Script**: Run `deploy/scripts/setup-ec2.sh` on Ubuntu 24.04/22.04 LTS.
- **Docker Compose**: Containerized multi-service setup (`docker compose up -d`).
- Comprehensive guide: **[AWS Hosting Guide](docs/aws-hosting-guide.md)**.

### S3 Object Storage Configuration

To enable live AWS S3 object storage:
1. Create a private bucket in the AWS S3 console with **Block all public access** enabled.
2. Enable default **AES-256 Server-Side Encryption**.
3. Create an IAM policy with least-privilege permissions (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:HeadObject`, `s3:ListBucket`).
4. Set the following in `backend/.env`:
   ```env
   STORAGE_PROVIDER=s3
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   ```
5. Restart the backend server. The navbar status indicator will automatically switch to **"AWS S3 Active"**.
*(See [docs/aws-setup.md](docs/aws-setup.md) for full instructions).*

---

## 9. Security & Privacy Safeguards

- **No Secrets in Source**: All sensitive credentials reside exclusively in uncommitted `.env` files.
- **Zero Client-Side AWS Keys**: AWS IAM credentials never reach the browser or JavaScript bundle.
- **Server-Side File Validation**: Validates file size (max 25 MB), file extension (`.pdf`, `.ppt`, `.pptx`), and magic byte headers (`%PDF-`, `PK\x03\x04`).
- **Compensating Transactions**: If a database write fails after uploading a file, the storage object is automatically cleaned up.
- **Parameterized Queries**: All SQLAlchemy queries use parameterized statements to prevent SQL injection.
- **Strict Ownership**: Students can only delete or edit notes they own.

---

## 10. Future Enhancements

- In-browser PDF document previewer using PDF.js.
- Student rating and peer-review badges for helpful lecture notes.
- Automatic syllabus OCR extraction using AWS Textract or Gemini API.
- Push notifications for new unit notes in a student's department.
