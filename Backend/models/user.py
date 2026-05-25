"""
User document schema (MongoDB collection: `users`)

{
    "_id":               ObjectId,
    "email":             str  (unique, indexed),
    "password_hash":     str  (bcrypt),
    "role":              "patient" | "doctor" | "admin",
    "full_name":         str,
    "national_health_id":str  (patients only, sparse index),
    "specialization":    str  (doctors only),
    "created_at":        datetime,
    "is_active":         bool
}
"""

from datetime import datetime, timezone
from bson import ObjectId


def build_user_document(
    email: str,
    password_hash: str,
    role: str,
    full_name: str,
    national_health_id: str = None,
    specialization: str = None,
) -> dict:
    """Return a validated user dict ready for MongoDB insertion."""
    if role not in ("patient", "doctor", "admin"):
        raise ValueError(f"Invalid role: {role}")

    doc = {
        "email":          email.lower().strip(),
        "password_hash":  password_hash,
        "role":           role,
        "full_name":      full_name.strip(),
        "created_at":     datetime.now(timezone.utc),
        "is_active":      True,
    }

    if role == "patient":
        if not national_health_id:
            raise ValueError("national_health_id is required for patients")
        doc["national_health_id"] = national_health_id.strip().upper()

    if role == "doctor":
        doc["specialization"] = (specialization or "General").strip()

    return doc


def serialize_user(user: dict) -> dict:
    """Return a safe public representation (no password hash)."""
    return {
        "id":                 str(user["_id"]),
        "email":              user["email"],
        "role":               user["role"],
        "full_name":          user["full_name"],
        "national_health_id": user.get("national_health_id"),
        "specialization":     user.get("specialization"),
        "created_at":         user["created_at"].isoformat(),
        "is_active":          user["is_active"],
    }
