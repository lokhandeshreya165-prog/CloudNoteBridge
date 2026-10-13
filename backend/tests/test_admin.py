"""Automated tests for administrator authorization boundaries and content moderation."""
import io


def test_student_forbidden_from_admin_endpoints(client, student_user):
    """Regular students must receive 403 Forbidden on administrator routes."""
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })

    assert client.get("/api/admin/stats").status_code == 403
    assert client.get("/api/admin/users").status_code == 403
    assert client.get("/api/admin/notes").status_code == 403
    assert client.get("/api/admin/reports").status_code == 403


def test_admin_access_and_moderation(client, admin_user, student_user):
    """Administrators can view users, system stats, reports, and remove notes."""
    # Jane (student) uploads note
    client.post("/api/auth/login", json={
        "email": "jane@college.edu",
        "password": "SecurePassword123!",
    })
    pdf_content = b"%PDF-1.4\n%flagged\n%%EOF"
    upload_resp = client.post("/api/notes", data={
        "title": "Outdated Syllabus Notes",
        "subject": "Chemistry",
        "department": "Science",
        "semester": "1",
        "unit_number": "1",
        "file": (io.BytesIO(pdf_content), "Chem1.pdf"),
    }, content_type="multipart/form-data")
    note_id = upload_resp.get_json()["note"]["id"]

    # Jane reports the note
    report_resp = client.post(f"/api/notes/{note_id}/report", json={
        "reason": "Outdated Content",
        "description": "This syllabus was replaced in 2024.",
    })
    assert report_resp.status_code == 201

    # Admin logs in
    client.post("/api/auth/login", json={
        "email": "admin@college.edu",
        "password": "AdminSecurePassword123!",
    })

    # Admin reads stats
    stats_resp = client.get("/api/admin/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.get_json()["stats"]
    assert stats["total_users"] >= 2
    assert stats["total_notes"] >= 1
    assert stats["pending_reports"] >= 1

    # Admin lists reports
    reports_resp = client.get("/api/admin/reports")
    assert reports_resp.status_code == 200
    reports = reports_resp.get_json()["reports"]
    assert len(reports) >= 1
    report_id = reports[0]["id"]

    # Admin updates report status
    patch_resp = client.patch(f"/api/admin/reports/{report_id}", json={"status": "resolved"})
    assert patch_resp.status_code == 200
    assert patch_resp.get_json()["report"]["status"] == "resolved"

    # Admin deletes flagged note
    del_resp = client.delete(f"/api/admin/notes/{note_id}")
    assert del_resp.status_code == 200
    assert del_resp.get_json()["success"] is True
