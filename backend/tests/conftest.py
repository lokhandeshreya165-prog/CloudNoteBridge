"""Pytest test configuration and fixtures for CloudNoteBridge."""
import os
import shutil
import pytest
from app import create_app
from app.config import TestConfig
from app.extensions import db
from app.models.user import User
from app.models.note import Note


@pytest.fixture(scope="session")
def app():
    """Create test application instance with in-memory database and test storage."""
    test_app = create_app(TestConfig)
    yield test_app

    # Cleanup test uploads dir if created
    if os.path.exists(TestConfig.LOCAL_STORAGE_DIR):
        shutil.rmtree(TestConfig.LOCAL_STORAGE_DIR, ignore_errors=True)


@pytest.fixture(scope="function")
def client(app):
    """Provide Flask test client with clean isolated database tables per test."""
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def student_user(app):
    """Create a verified sample student user."""
    with app.app_context():
        user = User(
            full_name="Jane Doe",
            email="jane@college.edu",
            department="Computer Science",
            semester=5,
            role="student",
            is_active=True,
        )
        user.set_password("SecurePassword123!")
        db.session.add(user)
        db.session.commit()
        return user.id


@pytest.fixture
def admin_user(app):
    """Create a verified sample administrator user."""
    with app.app_context():
        admin = User(
            full_name="Admin Chief",
            email="admin@college.edu",
            department="Administration",
            semester=1,
            role="admin",
            is_active=True,
        )
        admin.set_password("AdminSecurePassword123!")
        db.session.add(admin)
        db.session.commit()
        return admin.id


@pytest.fixture
def other_student(app):
    """Create a second student user for authorization boundary testing."""
    with app.app_context():
        user = User(
            full_name="Bob Smith",
            email="bob@college.edu",
            department="Electrical Engineering",
            semester=3,
            role="student",
            is_active=True,
        )
        user.set_password("BobSecurePassword123!")
        db.session.add(user)
        db.session.commit()
        return user.id
