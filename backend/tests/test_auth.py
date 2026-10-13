"""Automated tests for user registration, authentication, and session handling."""


def test_register_student_success(client):
    """Test successful student account registration."""
    payload = {
        "full_name": "Test Student",
        "email": "test@college.edu",
        "password": "Password123!",
        "department": "Computer Science",
        "semester": 4,
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True
    assert data["user"]["email"] == "test@college.edu"
    assert data["user"]["role"] == "student"


def test_register_duplicate_email_rejected(client, student_user):
    """Duplicate email registration must be rejected with 400 Bad Request."""
    payload = {
        "full_name": "Jane Impersonator",
        "email": "jane@college.edu",
        "password": "DifferentPassword123!",
        "department": "IT",
        "semester": 2,
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "already exists" in data["error"].lower()


def test_register_validation_short_password(client):
    """Passwords shorter than 8 characters must be rejected."""
    payload = {
        "full_name": "Short Pass User",
        "email": "short@college.edu",
        "password": "123",
        "department": "Civil",
        "semester": 1,
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "at least 8 characters" in data["error"]


def test_login_success_and_me_endpoint(client, student_user):
    """Verify login authenticates user and sets session cookie."""
    login_resp = client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })
    assert login_resp.status_code == 200
    data = login_resp.get_json()
    assert data["success"] is True
    assert data["user"]["full_name"] == "Jane Doe"

    # Verify session retrieval via /api/auth/me
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 200
    me_data = me_resp.get_json()
    assert me_data["user"] is not None
    assert me_data["user"]["email"] == "jane@college.edu"


def test_login_invalid_password_rejected(client, student_user):
    """Invalid password must be rejected with 401 Unauthorized."""
    response = client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "WrongPassword!",
    })
    assert response.status_code == 401
    data = response.get_json()
    assert data["success"] is False
    assert "invalid" in data["error"].lower()


def test_logout_clears_session(client, student_user):
    """Logout endpoint must invalidate active user session."""
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })
    # Verify logged in
    me_before = client.get("/api/auth/me").get_json()
    assert me_before["user"] is not None

    # Perform logout
    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200

    # Verify logged out
    me_after = client.get("/api/auth/me").get_json()
    assert me_after["user"] is None
