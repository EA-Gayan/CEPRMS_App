"""
JWT utility helpers.

Provides role-based JWT guard decorators used across all blueprints.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*roles):
    """
    Decorator that:
      1. Verifies a valid JWT is present (header or httpOnly cookie).
      2. Checks that the user's `role` claim is in the allowed `roles` list.

    Usage:
        @role_required("doctor", "admin")
        def some_protected_view(): ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Will raise 401 automatically if token is missing / invalid
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
