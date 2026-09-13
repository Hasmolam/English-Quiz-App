import asyncio
import datetime
import uuid
import jwt
import httpx
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, select

from auth import JWT_ALGORITHM, JWT_SECRET_KEY, create_access_token, create_refresh_token
from database import engine
from main import app
from models import RefreshToken, User, Word

client = TestClient(app)


def init_db():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        words = [
            Word(en="computer", tr="bilgisayar"),
            Word(en="keyboard", tr="klavye"),
            Word(en="screen", tr="ekran"),
            Word(en="mouse", tr="fare"),
            Word(en="cable", tr="kablo"),
        ]
        session.add_all(words)
        session.commit()
    print("Database initialized for edge case testing.\n")


def test_edge_case_1_input_validation():
    print("--- Edge Case 1: Input Validation & Sanitization ---")

    # 1. Whitespace-only username
    res = client.post("/auth/register", json={
        "username": "   ",
        "email": "valid@example.com",
        "password": "validpassword123"
    })
    assert res.status_code == 422, f"Expected 422, got {res.status_code}"
    print("  ✓ Whitespace-only username rejected (422)")

    # 2. Username too short (< 3 chars)
    res = client.post("/auth/register", json={
        "username": "ab",
        "email": "valid@example.com",
        "password": "validpassword123"
    })
    assert res.status_code == 422
    print("  ✓ Short username (<3 chars) rejected (422)")

    # 3. Username with forbidden special characters
    res = client.post("/auth/register", json={
        "username": "user<script>alert(1)</script>",
        "email": "valid@example.com",
        "password": "validpassword123"
    })
    assert res.status_code == 422
    print("  ✓ Username with XSS/special chars rejected (422)")

    # 4. Short password (< 6 chars)
    res = client.post("/auth/register", json={
        "username": "valid_user",
        "email": "valid@example.com",
        "password": "123"
    })
    assert res.status_code == 422
    print("  ✓ Password < 6 chars rejected (422)")

    # 5. Invalid email formats
    for bad_email in ["notanemail", "@example.com", "user@", "user@.com"]:
        res = client.post("/auth/register", json={
            "username": "valid_user",
            "email": bad_email,
            "password": "validpassword123"
        })
        assert res.status_code == 422, f"Failed for {bad_email}"
    print("  ✓ Invalid email formats rejected (422)")


def test_edge_case_2_case_insensitivity_and_trimming():
    print("\n--- Edge Case 2: Case Insensitivity & Trimming ---")

    # Register with mixed case and trailing spaces
    reg_res = client.post("/auth/register", json={
        "username": "  AlphaUser  ",
        "email": "  Alpha.User@Example.COM  ",
        "password": "MySecretPassword123"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()["user"]
    assert user_data["username"] == "AlphaUser"
    assert user_data["email"] == "alpha.user@example.com"
    print("  ✓ Registered with whitespace trimmed and email lowercased")

    # Duplicate registration with different case
    dup_res = client.post("/auth/register", json={
        "username": "alphauser",
        "email": "different@example.com",
        "password": "MySecretPassword123"
    })
    assert dup_res.status_code == 400
    print("  ✓ Duplicate username with different case rejected (400)")

    dup_email_res = client.post("/auth/register", json={
        "username": "different_user",
        "email": "ALPHA.USER@EXAMPLE.COM",
        "password": "MySecretPassword123"
    })
    assert dup_email_res.status_code == 400
    print("  ✓ Duplicate email with different case rejected (400)")

    # Login with all uppercase and spaces
    login_1 = client.post("/auth/login", json={
        "identifier": "  ALPHAUSER  ",
        "password": "MySecretPassword123"
    })
    assert login_1.status_code == 200
    print("  ✓ Login with uppercase username & spaces succeeded")

    login_2 = client.post("/auth/login", json={
        "identifier": "ALPHA.USER@EXAMPLE.COM",
        "password": "MySecretPassword123"
    })
    assert login_2.status_code == 200
    print("  ✓ Login with uppercase email succeeded")


def test_edge_case_3_token_type_and_tampering():
    print("\n--- Edge Case 3: Token Type Mismatch & Tampering ---")

    reg = client.post("/auth/register", json={
        "username": "token_tester",
        "email": "token@test.com",
        "password": "tokenpassword123"
    }).json()

    access_token = reg["access_token"]
    refresh_token = reg["refresh_token"]

    # 1. Sending Access Token to /auth/refresh (wrong type)
    wrong_type_res = client.post("/auth/refresh", json={"refresh_token": access_token})
    assert wrong_type_res.status_code == 401
    print("  ✓ Sending access token to /auth/refresh rejected (401)")

    # 2. Sending Refresh Token to protected endpoint /auth/me (wrong type)
    wrong_bearer_res = client.get("/auth/me", headers={"Authorization": f"Bearer {refresh_token}"})
    assert wrong_bearer_res.status_code == 401
    print("  ✓ Sending refresh token to /auth/me rejected (401)")

    # 3. Completely malformed token
    malformed_res = client.get("/auth/me", headers={"Authorization": "Bearer not.a.valid.jwt"})
    assert malformed_res.status_code == 401
    print("  ✓ Malformed JWT rejected (401)")

    # 4. Token signed with wrong secret
    fake_token = jwt.encode(
        {"sub": "1", "username": "token_tester", "type": "access", "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
        "WRONG_SECRET_KEY_12345678901234567890",
        algorithm="HS256"
    )
    fake_res = client.get("/auth/me", headers={"Authorization": f"Bearer {fake_token}"})
    assert fake_res.status_code == 401
    print("  ✓ Token signed with wrong secret rejected (401)")

    # 5. Token with algorithm 'none'
    header = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0"  # {"alg":"none","typ":"JWT"}
    payload = "eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwidHlwZSI6ImFjY2VzcyJ9"
    none_token = f"{header}.{payload}."
    none_res = client.get("/auth/me", headers={"Authorization": f"Bearer {none_token}"})
    assert none_res.status_code == 401
    print("  ✓ Algorithm 'none' attack rejected (401)")

    # 6. Expired access token
    past = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
    expired_token = jwt.encode(
        {"sub": "1", "username": "token_tester", "type": "access", "exp": past, "iat": past},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )
    exp_res = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert exp_res.status_code == 401
    print("  ✓ Expired access token rejected (401)")

    # 7. Token for non-existent user ID
    ghost_token = create_access_token(999999, "ghost_user")
    ghost_res = client.get("/auth/me", headers={"Authorization": f"Bearer {ghost_token}"})
    assert ghost_res.status_code == 401
    print("  ✓ Token for deleted/non-existent user rejected (401)")


def test_edge_case_4_multi_step_replay_attack():
    print("\n--- Edge Case 4: Multi-Step Token Rotation & Replay Chain ---")

    login = client.post("/auth/login", json={"identifier": "token_tester", "password": "tokenpassword123"}).json()
    t1_refresh = login["refresh_token"]

    # Step 1: Rotate t1 -> t2
    step1 = client.post("/auth/refresh", json={"refresh_token": t1_refresh})
    assert step1.status_code == 200
    t2_refresh = step1.json()["refresh_token"]

    # Step 2: Rotate t2 -> t3
    step2 = client.post("/auth/refresh", json={"refresh_token": t2_refresh})
    assert step2.status_code == 200
    t3_refresh = step2.json()["refresh_token"]

    # Step 3: Rotate t3 -> t4
    step3 = client.post("/auth/refresh", json={"refresh_token": t3_refresh})
    assert step3.status_code == 200
    t4_refresh = step3.json()["refresh_token"]
    print("  ✓ Rotation chain completed: t1 -> t2 -> t3 -> t4")

    # Step 4: Replay attack with t2 (which was replaced by t3)
    replay_res = client.post("/auth/refresh", json={"refresh_token": t2_refresh})
    assert replay_res.status_code == 401
    print("  ✓ Replay of intermediate token t2 blocked with 401")

    # Step 5: Verify that the newest token (t4) has also been invalidated!
    t4_check = client.post("/auth/refresh", json={"refresh_token": t4_refresh})
    assert t4_check.status_code == 401
    print("  ✓ Newest token t4 is now invalid because family was revoked")


def test_edge_case_5_quiz_boundary_conditions():
    print("\n--- Edge Case 5: Quiz Boundary Conditions ---")

    # Fresh login
    login = client.post("/auth/login", json={"identifier": "token_tester", "password": "tokenpassword123"}).json()
    token = login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Answer to non-existent word ID
    res = client.post("/quiz/answer", json={"word_id": 999999, "answer": "anything"}, headers=headers)
    assert res.status_code == 404
    print("  ✓ Non-existent word ID answered -> 404 Not Found")

    # 2. Answer with case and whitespace differences
    start = client.get("/quiz/start", headers=headers).json()
    q = start["questions"][0]
    word_id = q["id"]

    with Session(engine) as session:
        word = session.get(Word, word_id)
        correct_en = word.en

    # Submit correct answer with upper/lowercase & spaces
    ans_res = client.post("/quiz/answer", json={
        "word_id": word_id,
        "answer": f"  {correct_en.upper()}  "
    }, headers=headers)
    assert ans_res.status_code == 200
    ans_data = ans_res.json()
    assert ans_data["correct"] is True
    print("  ✓ Case and whitespace differences in quiz answer counted as correct")

    # 3. Unauthenticated calls to quiz endpoints
    assert client.get("/quiz/start").status_code in (401, 403)
    assert client.post("/quiz/answer", json={"word_id": word_id, "answer": "test"}).status_code in (401, 403)
    assert client.post("/quiz/finish").status_code in (401, 403)
    assert client.get("/quiz/daily_progress").status_code in (401, 403)
    assert client.get("/quiz/stats").status_code in (401, 403)
    print("  ✓ All protected quiz endpoints strictly reject unauthenticated calls")


def test_edge_case_6_logout_robustness():
    print("\n--- Edge Case 6: Logout Robustness ---")

    # 1. Normal logout
    login = client.post("/auth/login", json={"identifier": "token_tester", "password": "tokenpassword123"}).json()
    ref_token = login["refresh_token"]

    logout_res = client.post("/auth/logout", json={"refresh_token": ref_token})
    assert logout_res.status_code == 200
    print("  ✓ Normal logout succeeded")

    # Verify refresh token is revoked
    after_logout = client.post("/auth/refresh", json={"refresh_token": ref_token})
    assert after_logout.status_code == 401
    print("  ✓ Refresh token revoked after logout")

    # 2. Duplicate logout call with already revoked token
    dup_logout = client.post("/auth/logout", json={"refresh_token": ref_token})
    assert dup_logout.status_code == 200
    print("  ✓ Duplicate logout returns 200 gracefully")

    # 3. Logout with completely garbage token
    garbage_logout = client.post("/auth/logout", json={"refresh_token": "garbage.token.string"})
    assert garbage_logout.status_code == 200
    print("  ✓ Logout with invalid token returns 200 gracefully")


if __name__ == "__main__":
    init_db()
    test_edge_case_1_input_validation()
    test_edge_case_2_case_insensitivity_and_trimming()
    test_edge_case_3_token_type_and_tampering()
    test_edge_case_4_multi_step_replay_attack()
    test_edge_case_5_quiz_boundary_conditions()
    test_edge_case_6_logout_robustness()
    print("\n=======================================================")
    print("🎉 ALL EDGE CASE TESTS PASSED WITH ZERO ERRORS! 🎉")
    print("=======================================================\n")
