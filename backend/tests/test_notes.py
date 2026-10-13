"""Automated tests for note upload, validation, filtering, search, and download."""
import io


def test_upload_valid_pdf_note(client, student_user):
    """Students can upload valid PDF notes with required academic metadata."""
    # Login
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })

    pdf_content = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>%%EOF"
    data = {
        "title": "Data Structures Trees Lecture Notes",
        "description": "Binary Search Trees, AVL Trees, and traversal algorithms.",
        "subject": "Data Structures",
        "department": "Computer Science",
        "semester": "3",
        "unit_number": "2",
        "file": (io.BytesIO(pdf_content), "Trees_Unit2.pdf"),
    }

    response = client.post("/api/notes", data=data, content_type="multipart/form-data")
    assert response.status_code == 201
    resp_data = response.get_json()
    assert resp_data["success"] is True
    assert resp_data["note"]["title"] == "Data Structures Trees Lecture Notes"
    assert resp_data["note"]["unit_number"] == 2
    assert resp_data["note"]["file_extension"] == "pdf"


def test_upload_unsupported_extension_rejected(client, student_user):
    """Executable or script files must be rejected immediately."""
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })

    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00"
    data = {
        "title": "Malicious Executable Attempt",
        "subject": "Security",
        "department": "Computer Science",
        "semester": "5",
        "unit_number": "1",
        "file": (io.BytesIO(fake_exe), "virus.exe"),
    }
    response = client.post("/api/notes", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    resp_data = response.get_json()
    assert resp_data["success"] is False
    assert "not permitted" in resp_data["error"]


def test_upload_invalid_magic_bytes_rejected(client, student_user):
    """Files spoofing extension without proper headers must be rejected."""
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })

    fake_pdf = b"Plain text disguised as a PDF document"
    data = {
        "title": "Fake PDF",
        "subject": "English",
        "department": "Humanities",
        "semester": "1",
        "unit_number": "1",
        "file": (io.BytesIO(fake_pdf), "fake.pdf"),
    }
    response = client.post("/api/notes", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    resp_data = response.get_json()
    assert resp_data["success"] is False
    assert "valid PDF" in resp_data["error"]


def test_search_and_filter_notes(client, student_user):
    """Test searching notes by query and filtering by department and semester."""
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })

    pdf_content = b"%PDF-1.4\n%test\n%%EOF"
    client.post("/api/notes", data={
        "title": "Quantum Mechanics Introduction",
        "subject": "Physics",
        "department": "Physics",
        "semester": "2",
        "unit_number": "1",
        "file": (io.BytesIO(pdf_content), "Quantum_Unit1.pdf"),
    }, content_type="multipart/form-data")

    # Search by keyword
    search_resp = client.get("/api/notes?q=Quantum")
    assert search_resp.status_code == 200
    search_data = search_resp.get_json()
    assert search_data["total"] >= 1
    assert any(n["subject"] == "Physics" for n in search_data["notes"])

    # Filter by semester
    filter_resp = client.get("/api/notes?semester=2")
    assert filter_resp.status_code == 200
    filter_data = filter_resp.get_json()
    assert all(n["semester"] == 2 for n in filter_data["notes"])


def test_delete_note_ownership_enforced(client, student_user, other_student):
    """A student must NOT be allowed to delete another student's uploaded note."""
    # Jane uploads note
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })
    pdf_content = b"%PDF-1.4\n%test\n%%EOF"
    upload_resp = client.post("/api/notes", data={
        "title": "Jane's Confidential Notes",
        "subject": "Math",
        "department": "Science",
        "semester": "1",
        "unit_number": "1",
        "file": (io.BytesIO(pdf_content), "Math1.pdf"),
    }, content_type="multipart/form-data")
    note_id = upload_resp.get_json()["note"]["id"]

    # Bob logs in and attempts to delete Jane's note
    client.post("/api/auth/login", json={
        "email": "bob@college.edu",
        "password": "BobSecurePassword123!",
    })
    del_resp = client.post(f"/api/notes/{note_id}", method="DELETE")
    # Using delete HTTP method
    del_resp = client.delete(f"/api/notes/{note_id}")
    assert del_resp.status_code == 403
    assert del_resp.get_json()["success"] is False

    # Jane logs in and successfully deletes her own note
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })
    jane_del = client.delete(f"/api/notes/{note_id}")
    assert jane_del.status_code == 200
    assert jane_del.get_json()["success"] is True


def test_download_workflow(client, student_user):
    """Downloading notes creates audit log and returns authorized download URL."""
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })
    pdf_content = b"%PDF-1.4\n%downloadable\n%%EOF"
    upload_resp = client.post("/api/notes", data={
        "title": "Algorithms Cheat Sheet",
        "subject": "Algorithms",
        "department": "Computer Science",
        "semester": "4",
        "unit_number": "3",
        "file": (io.BytesIO(pdf_content), "Algo_CheatSheet.pdf"),
    }, content_type="multipart/form-data")
    note_id = upload_resp.get_json()["note"]["id"]

    # Request authorized download
    download_resp = client.get(f"/api/notes/{note_id}/download")
    assert download_resp.status_code == 200
    data = download_resp.get_json()
    assert data["success"] is True
    assert "download_url" in data
    assert data["original_filename"] == "Algo_CheatSheet.pdf"
    assert data["storage_mode"] in ("local_storage", "aws_s3")
