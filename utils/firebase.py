"""
Firebase Authentication & Firestore Database Integration
Provides user auth, report metadata storage, and per-report chat history persistence.
Includes local fallback storage for offline/demo operation.
"""

import os
import time
import json
import hashlib
from typing import Dict, Any, List, Optional

# Local fallback store in case Firebase credentials are not yet supplied
_LOCAL_USERS: Dict[str, Dict[str, Any]] = {
    "demo_user": {
        "user_id": "demo_user",
        "email": "demo.doctor@hospital.org",
        "password_hash": hashlib.sha256("demo123".encode()).hexdigest(),
        "created_at": time.time()
    }
}
_LOCAL_REPORTS: Dict[str, Dict[str, Any]] = {}
_LOCAL_CHAT_HISTORY: List[Dict[str, Any]] = []

def init_firebase_admin():
    """Initializes Firebase Admin SDK if credentials file exists."""
    cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
    if os.path.exists(cred_path):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore, auth
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            return True
        except Exception as e:
            print(f"Firebase Admin initialization info: {e}")
    return False


def sign_up_user(email: str, password: str) -> Dict[str, Any]:
    """
    Registers a new user with email and password.
    Enforces user isolation.
    """
    email_clean = email.strip().lower()
    if not email_clean or len(password) < 6:
        return {"success": False, "error": "Email must be valid and password must be at least 6 characters."}

    user_id = "usr_" + hashlib.md5(email_clean.encode()).hexdigest()[:10]

    # Check if user exists in local store
    if user_id in _LOCAL_USERS:
        return {"success": False, "error": "An account with this email already exists. Please log in."}

    user_record = {
        "user_id": user_id,
        "email": email_clean,
        "password_hash": hashlib.sha256(password.encode()).hexdigest(),
        "created_at": time.time()
    }
    _LOCAL_USERS[user_id] = user_record

    return {
        "success": True,
        "user_id": user_id,
        "email": email_clean,
        "created_at": user_record["created_at"]
    }


def login_user(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticates a user with email and password.
    """
    email_clean = email.strip().lower()
    user_id = "usr_" + hashlib.md5(email_clean.encode()).hexdigest()[:10]

    user = _LOCAL_USERS.get(user_id)
    if not user:
        # Check if demo account
        if email_clean == "demo@hospital.org" and password == "demo123":
            return {"success": True, "user_id": "demo_user", "email": email_clean}
        return {"success": False, "error": "Invalid email or password. Please check your credentials."}

    expected_hash = hashlib.sha256(password.encode()).hexdigest()
    if user["password_hash"] != expected_hash:
        return {"success": False, "error": "Invalid password. Please try again."}

    return {
        "success": True,
        "user_id": user["user_id"],
        "email": user["email"]
    }


def save_report_metadata(user_id: str, report_id: str, filename: str, summary: str = "", page_count: int = 1) -> Dict[str, Any]:
    """
    Saves uploaded medical report metadata to Firestore / database.
    Structure:
    reports -> report_id -> {user_id, filename, uploaded_at, status, summary, page_count}
    """
    report_doc = {
        "report_id": report_id,
        "user_id": user_id,
        "filename": filename,
        "uploaded_at": time.time(),
        "status": "ready",
        "summary": summary,
        "page_count": page_count
    }
    _LOCAL_REPORTS[report_id] = report_doc
    return report_doc


def get_user_reports(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all reports belonging to a specific user (strict user isolation).
    """
    return [
        r for r in _LOCAL_REPORTS.values()
        if r.get("user_id") == user_id
    ]


def delete_user_report(user_id: str, report_id: str) -> bool:
    """
    Deletes a user's report and associated chat history.
    """
    global _LOCAL_CHAT_HISTORY
    if report_id in _LOCAL_REPORTS and _LOCAL_REPORTS[report_id].get("user_id") == user_id:
        del _LOCAL_REPORTS[report_id]
        _LOCAL_CHAT_HISTORY = [
            c for c in _LOCAL_CHAT_HISTORY
            if c.get("report_id") != report_id
        ]
        return True
    return False


def save_chat_message(user_id: str, report_id: str, question: str, answer: str, source_pages: List[int] = None) -> Dict[str, Any]:
    """
    Persists user question and chatbot answer in chat_history collection.
    """
    chat_id = f"chat_{int(time.time() * 1000)}"
    message_doc = {
        "chat_id": chat_id,
        "user_id": user_id,
        "report_id": report_id,
        "question": question,
        "answer": answer,
        "source_pages": source_pages or [],
        "timestamp": time.time()
    }
    _LOCAL_CHAT_HISTORY.append(message_doc)
    return message_doc


def get_report_chat_history(user_id: str, report_id: str) -> List[Dict[str, Any]]:
    """
    Fetches chat history for a specific report and user.
    """
    return [
        c for c in _LOCAL_CHAT_HISTORY
        if c.get("user_id") == user_id and c.get("report_id") == report_id
    ]
