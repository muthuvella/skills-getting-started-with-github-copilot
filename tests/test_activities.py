import os
import sys
from fastapi.testclient import TestClient

# Ensure the src directory is on the import path so tests can import app
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "src")
if SRC not in sys.path:
    sys.path.insert(0, SRC)

import app as myapp


client = TestClient(myapp.app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    # basic shape checks
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    activity = "Chess Club"
    email = "test.student@mergington.edu"

    # Ensure not already present
    resp = client.get("/activities")
    participants = resp.json()[activity]["participants"]
    if email in participants:
        # remove so test can run cleanly
        client.delete(f"/activities/{activity}/unregister?email={email}")

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert "Signed up" in resp.json().get("message", "")

    # Confirm present
    resp = client.get("/activities")
    participants = resp.json()[activity]["participants"]
    assert email in participants

    # Unregister
    resp = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert resp.status_code == 200
    assert "Unregistered" in resp.json().get("message", "")

    # Confirm removed
    resp = client.get("/activities")
    participants = resp.json()[activity]["participants"]
    assert email not in participants
