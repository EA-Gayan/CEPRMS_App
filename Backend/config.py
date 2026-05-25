import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ─── Security ────────────────────────────────────────────────────────────
    SECRET_KEY                 = os.getenv("SECRET_KEY", "change-me-in-production-256bits")
    JWT_SECRET_KEY             = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-me-256bits")
    JWT_ACCESS_TOKEN_EXPIRES   = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES  = timedelta(days=7)
    # Store JWT in httpOnly cookies → mitigates XSS
    JWT_TOKEN_LOCATION         = ["headers", "cookies"]
    JWT_COOKIE_SECURE          = False          # True in production (HTTPS only)
    JWT_COOKIE_SAMESITE        = "Lax"
    JWT_COOKIE_CSRF_PROTECT    = True

    # ─── AES-256 key for medical records (32-byte base64-encoded string) ──────
    AES_ENCRYPTION_KEY         = os.getenv("AES_ENCRYPTION_KEY", "")

    # ─── MongoDB ──────────────────────────────────────────────────────────────
    MONGO_URI                  = os.getenv("MONGO_URI", "mongodb://localhost:27017/ceperm")
    MONGO_DB_NAME              = "ceperm"

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    RATELIMIT_DEFAULT          = "200 per day;50 per hour"
    RATELIMIT_STORAGE_URI      = "memory://"
    RATELIMIT_STRATEGY         = "fixed-window"

    # ─── CORS ─────────────────────────────────────────────────────────────────
    FRONTEND_ORIGIN            = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
