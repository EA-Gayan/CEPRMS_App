"""
Phase 1 – Authentication Blueprint
Routes:
    POST /api/auth/register   – Create a new patient or doctor account
    POST /api/auth/login      – Validate credentials, return JWT (set httpOnly cookie)
    POST /api/auth/logout     – Clear the JWT cookie
    GET  /api/auth/me         – Return current user profile from JWT
"""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from pymongo.errors import DuplicateKeyError

from app import bcrypt, db, limiter
from models.user import build_user_document, serialize_user
from models.audit_log import log_action

auth_bp = Blueprint("auth", __name__)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    """
    Register a new user (patient or doctor).

    Expected JSON body:
    {
        "email":             "user@example.com",
        "password":          "SecurePass123!",
        "role":              "patient" | "doctor",
        "full_name":         "Jane Doe",
        "national_health_id":"NHI-00123",   ← patients only
        "specialization":    "Cardiology"   ← doctors only
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # ── Required field validation ─────────────────────────────────────────
    required = ["email", "password", "role", "full_name"]
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    role = data["role"]
    if role == "patient" and not data.get("national_health_id"):
        return jsonify({"error": "national_health_id is required for patients"}), 400

    # ── Password strength (minimum 8 chars) ──────────────────────────────
    if len(data["password"]) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    # ── Hash password ─────────────────────────────────────────────────────
    pw_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    try:
        user_doc = build_user_document(
            email              = data["email"],
            password_hash      = pw_hash,
            role               = role,
            full_name          = data["full_name"],
            national_health_id = data.get("national_health_id"),
            specialization     = data.get("specialization"),
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        result   = db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
    except DuplicateKeyError:
        return jsonify({"error": "An account with this email already exists"}), 409

    log_action(db, str(result.inserted_id), role, "USER_REGISTERED")

    return jsonify({
        "message": "Account created successfully",
        "user":    serialize_user(user_doc),
    }), 201


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20 per hour")          # Brute-force protection
def login():
    """
    Authenticate a user and return a JWT stored in httpOnly cookies.

    Expected JSON body:
    {
        "email":    "user@example.com",
        "password": "SecurePass123!"
    }
    """
    data = request.get_json(silent=True)
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = db.users.find_one({"email": data["email"].lower().strip()})

    # Use constant-time comparison to resist timing attacks
    if not user or not bcrypt.check_password_hash(user["password_hash"], data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.get("is_active", True):
        return jsonify({"error": "Account is deactivated. Contact support."}), 403

    user_id = str(user["_id"])

    # ── Create tokens with extra claims (role embedded in JWT payload) ────
    additional_claims = {"role": user["role"], "full_name": user["full_name"]}
    access_token  = create_access_token(identity=user_id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user_id, additional_claims=additional_claims)

    log_action(db, user_id, user["role"], "USER_LOGIN", meta={"email": user["email"]})

    # ── Set tokens in httpOnly cookies ────────────────────────────────────
    response = make_response(jsonify({
        "message":  "Login successful",
        "user":     serialize_user(user),
    }))
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/logout
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Clear JWT cookies — effectively logs the user out."""
    response = make_response(jsonify({"message": "Logged out successfully"}))
    unset_jwt_cookies(response)
    return response, 200


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/auth/me
# ─────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Return the currently authenticated user's profile."""
    from bson import ObjectId
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": serialize_user(user)}), 200
