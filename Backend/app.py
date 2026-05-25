from flask import Flask
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from pymongo import MongoClient

from config import Config

# ── Extension instances (no app bound yet) ─────────────────────────────────
jwt     = JWTManager()
bcrypt  = Bcrypt()
limiter = Limiter(key_func=get_remote_address)
db      = None   # will be set in create_app()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS: allow React dev server ──────────────────────────────────────────
    CORS(
        app,
        origins=[app.config["FRONTEND_ORIGIN"]],
        supports_credentials=True,
    )

    # ── Extensions ───────────────────────────────────────────────────────────
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # ── MongoDB connection ────────────────────────────────────────────────────
    global db
    client = MongoClient(app.config["MONGO_URI"])
    db = client[app.config["MONGO_DB_NAME"]]

    # ── Ensure indexes for performance & uniqueness ───────────────────────────
    db.users.create_index("email", unique=True)
    db.users.create_index("national_health_id", sparse=True)
    db.consent_grants.create_index([("patient_id", 1), ("doctor_id", 1)])
    db.audit_logs.create_index("timestamp")

    # ── Register Blueprints ───────────────────────────────────────────────────
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(debug=True, port=5000)
