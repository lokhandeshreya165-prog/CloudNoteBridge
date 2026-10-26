"""Application factory for CloudNoteBridge."""
import os
import click
from flask import Flask
from app.config import Config
from app.extensions import db, cors
from app.services.storage_service import create_storage_service
from app.routes import register_routes
from app.utils.errors import register_error_handlers


def create_app(config_class=None) -> Flask:
    """Create and configure the Flask application using the factory pattern."""
    app = Flask(__name__)

    if config_class is None:
        config_class = Config
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Configure CORS with explicit trusted origins
    cors_origins = app.config.get("CORS_ORIGINS", ["http://localhost:5173", "http://127.0.0.1:5173"])
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
    )

    # Initialize Storage Service (AWS S3 or Local Development Fallback)
    setattr(app, "storage_service", create_storage_service(app.config))

    # Register error handlers and blueprints
    register_error_handlers(app)
    register_routes(app)

    # Register custom CLI commands
    register_cli_commands(app)

    # Automatically ensure database tables exist in development
    with app.app_context():
        try:
            from . import models  # noqa: F401
            db.create_all()
        except Exception as exc:
            app.logger.warning(f"Database auto-migration warning: {exc}")

    return app


def register_cli_commands(app: Flask) -> None:
    """Register custom administrative management CLI commands."""

    @app.cli.command("init-db")
    def init_db_command():
        """Create database tables."""
        from app.models import User, Note, DownloadHistory, NoteReport
        db.create_all()
        click.echo("Initialized database tables successfully.")

    @app.cli.command("create-admin")
    @click.option("--email", prompt="Admin Email", help="Administrator email address.")
    @click.option("--name", prompt="Full Name", default="System Administrator", help="Administrator full name.")
    @click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True, help="Admin password.")
    @click.option("--department", default="Administration", help="Admin department.")
    def create_admin_command(email, name, password, department):
        """Create an initial administrator account safely from CLI."""
        from app.models.user import User

        email = email.strip().lower()
        existing = User.query.filter_by(email=email).first()
        if existing:
            existing.role = "admin"
            existing.set_password(password)
            db.session.commit()
            click.echo(f"Updated existing user '{email}' to administrator role.")
            return

        admin = User(
            full_name=name.strip(),
            email=email,
            department=department.strip(),
            semester=1,
            role="admin",
            is_active=True,
        )
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        click.echo(f"Created administrator account: {email}")

    @app.cli.command("seed-data")
    def seed_data_command():
        """Seed sample academic notes metadata for local development testing."""
        from app.models.user import User
        from app.models.note import Note

        # Ensure demo student exists
        demo_student = User.query.filter_by(email="student@college.edu").first()
        if not demo_student:
            demo_student = User(
                full_name="Alex Chen",
                email="student@college.edu",
                department="Computer Science & Engineering",
                semester=5,
                role="student",
                is_active=True,
            )
            demo_student.set_password("StudentPass123!")
            db.session.add(demo_student)
            db.session.commit()
            click.echo("Created sample student: student@college.edu (StudentPass123!)")

        # Create demo notes if none exist
        if Note.query.count() == 0:
            sample_notes = [
                {
                    "title": "Unit 1: Relational Database Models & Normalization",
                    "description": "Complete lecture notes covering 1NF, 2NF, 3NF, BCNF, Functional Dependencies, and ER to Relational schema mapping with examples.",
                    "subject": "Database Management Systems",
                    "department": "Computer Science & Engineering",
                    "semester": 5,
                    "unit_number": 1,
                    "original_filename": "DBMS_Unit1_Normalization.pdf",
                    "file_extension": "pdf",
                    "mime_type": "application/pdf",
                    "file_size": 2450000,
                },
                {
                    "title": "Unit 2: SQL Query Optimization & Indexing",
                    "description": "B+ Tree indexing, query execution plans, hash indexes, and indexing best practices for MySQL 8.",
                    "subject": "Database Management Systems",
                    "department": "Computer Science & Engineering",
                    "semester": 5,
                    "unit_number": 2,
                    "original_filename": "DBMS_Unit2_Indexing.pdf",
                    "file_extension": "pdf",
                    "mime_type": "application/pdf",
                    "file_size": 1850000,
                },
                {
                    "title": "Unit 3: Operating System Process Scheduling & Threads",
                    "description": "Round Robin, SJF, Priority scheduling algorithms, race conditions, semaphores, and mutex implementations in C.",
                    "subject": "Operating Systems",
                    "department": "Computer Science & Engineering",
                    "semester": 4,
                    "unit_number": 3,
                    "original_filename": "OS_Unit3_Scheduling.pdf",
                    "file_extension": "pdf",
                    "mime_type": "application/pdf",
                    "file_size": 3120000,
                },
                {
                    "title": "Unit 1: Computer Networks OSI & TCP/IP Architecture Slides",
                    "description": "High-yield presentation slides covering physical, data link, network, transport, and application layers.",
                    "subject": "Computer Networks",
                    "department": "Information Technology",
                    "semester": 5,
                    "unit_number": 1,
                    "original_filename": "CN_Unit1_Architecture.pptx",
                    "file_extension": "pptx",
                    "mime_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    "file_size": 4200000,
                },
                {
                    "title": "Unit 4: Cloud Computing S3 & Serverless Systems",
                    "description": "Object storage architecture, IAM security principles, S3 bucket policies, and presigned URL access mechanisms.",
                    "subject": "Cloud Computing",
                    "department": "Computer Science & Engineering",
                    "semester": 6,
                    "unit_number": 4,
                    "original_filename": "Cloud_Unit4_S3_Storage.pdf",
                    "file_extension": "pdf",
                    "mime_type": "application/pdf",
                    "file_size": 2980000,
                },
            ]

            from app.services.storage_service import get_app_storage_service
            storage_service = get_app_storage_service(app)
            import io

            for item in sample_notes:
                storage_key = f"notes/sample_{item['original_filename']}"
                # If local storage, write dummy PDF/PPTX content bytes so downloads succeed
                dummy_content = b"%PDF-1.4\n%sample academic note content\n%%EOF" if item["file_extension"] == "pdf" else b"PK\x03\x04\x14\x00\x06\x00\x08\x00sample_pptx"
                storage_service.upload_file(io.BytesIO(dummy_content), storage_key, item["mime_type"])

                note = Note(
                    title=item["title"],
                    description=item["description"],
                    subject=item["subject"],
                    department=item["department"],
                    semester=item["semester"],
                    unit_number=item["unit_number"],
                    uploader_id=demo_student.id,
                    storage_key=storage_key,
                    original_filename=item["original_filename"],
                    generated_storage_filename=f"sample_{item['original_filename']}",
                    file_extension=item["file_extension"],
                    mime_type=item["mime_type"],
                    file_size=item["file_size"],
                )
                db.session.add(note)

            db.session.commit()
            click.echo("Seeded sample development notes successfully.")
