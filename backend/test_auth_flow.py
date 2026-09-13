import os
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, select

from database import engine
from main import app
from models import RefreshToken, User, Word

client = TestClient(app)


def setup_module():
    """Reset database and seed words for testing."""
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Seed test words
        words = [
            Word(en="apple", tr="elma"),
            Word(en="book", tr="kitap"),
            Word(en="cat", tr="kedi"),
            Word(en="door", tr="kapı"),
            Word(en="elephant", tr="fil"),
            Word(en="flower", tr="çiçek"),
            Word(en="garden", tr="bahçe"),
            Word(en="house", tr="ev"),
        ]
        session.add_all(words)
        session.commit()
    print("\n[SETUP] Test database initialized and seeded.")


def test_full_auth_and_quiz_flow():
    # 1. Registration
    reg_payload = {
        "username": "coder_test",
        "email": "coder@example.com",
        "password": "SuperSecretPassword123!",
    }
    reg_res = client.post("/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["user"]["username"] == "coder_test"
    assert reg_data["user"]["email"] == "coder@example.com"
    print("✅ 1. Registration succeeded.")

    initial_access_token = reg_data["access_token"]
    initial_refresh_token = reg_data["refresh_token"]

    # 2. Reject Duplicate Registration
    dup_res = client.post("/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    print("✅ 2. Duplicate registration correctly rejected.")

    # 3. Login with valid credentials
    login_res = client.post("/auth/login", json={
        "identifier": "coder_test",
        "password": "SuperSecretPassword123!",
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert "refresh_token" in login_data
    login_access_token = login_data["access_token"]
    login_refresh_token = login_data["refresh_token"]
    print("✅ 3. Login succeeded with valid credentials.")

    # 4. Login with invalid password
    bad_login = client.post("/auth/login", json={
        "identifier": "coder_test",
        "password": "WrongPassword",
    })
    assert bad_login.status_code == 401
    print("✅ 4. Invalid credentials rejected.")

    # 5. Access protected /auth/me
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {login_access_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "coder_test"
    print("✅ 5. /auth/me accessed successfully.")

    # 6. Reject unauthenticated access
    unauth_res = client.get("/auth/me")
    assert unauth_res.status_code in (401, 403)
    print("✅ 6. Unauthenticated request rejected.")

    # 7. Refresh Token Rotation (RTR)
    ref_res = client.post("/auth/refresh", json={"refresh_token": login_refresh_token})
    assert ref_res.status_code == 200, f"Refresh failed: {ref_res.text}"
    ref_data = ref_res.json()
    new_access_token = ref_data["access_token"]
    new_refresh_token = ref_data["refresh_token"]
    assert new_access_token != login_access_token
    assert new_refresh_token != login_refresh_token
    print("✅ 7. Refresh Token Rotation succeeded (new token pair received).")

    # 8. Replay Attack Detection: try to reuse the OLD refresh token!
    replay_res = client.post("/auth/refresh", json={"refresh_token": login_refresh_token})
    assert replay_res.status_code == 401, "Replay attack was NOT rejected!"
    print("✅ 8. Replay attack detected and rejected with 401.")

    # 9. Verify that token family was invalidated by replay attack!
    # Even the new_refresh_token from step 7 should now be revoked
    family_test_res = client.post("/auth/refresh", json={"refresh_token": new_refresh_token})
    assert family_test_res.status_code == 401, "Token family was not invalidated after replay attack!"
    print("✅ 9. Entire token family invalidated after replay attack.")

    # 10. Quiz Flow with new login
    # Login again to get a fresh valid session
    fresh_login = client.post("/auth/login", json={
        "identifier": "coder@example.com",
        "password": "SuperSecretPassword123!",
    })
    token = fresh_login.json()["access_token"]
    auth_header = {"Authorization": f"Bearer {token}"}

    # Start Quiz
    quiz_res = client.get("/quiz/start", headers=auth_header)
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    assert "user_id" in quiz_data
    assert "clerk_id" not in quiz_data  # verify clerk_id is gone
    assert len(quiz_data["questions"]) == 5
    q1 = quiz_data["questions"][0]
    print(f"✅ 10. Quiz started cleanly. Question: {q1['question']} with {len(q1['options'])} options.")

    # Submit Answer
    ans_res = client.post("/quiz/answer", json={
        "word_id": q1["id"],
        "answer": q1["options"][0],
    }, headers=auth_header)
    assert ans_res.status_code == 200
    print("✅ 11. Answer submitted successfully.")

    # Stats & Leaderboard
    stats_res = client.get("/quiz/stats", headers=auth_header)
    assert stats_res.status_code == 200
    lb_res = client.get("/quiz/leaderboard")
    assert lb_res.status_code == 200
    assert len(lb_res.json()) >= 1
    print("✅ 12. Stats & Leaderboard work seamlessly.")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n")


if __name__ == "__main__":
    setup_module()
    test_full_auth_and_quiz_flow()
