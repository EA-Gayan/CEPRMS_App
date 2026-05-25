from datetime import datetime, timezone
from bson import ObjectId


def log_action(db, actor_id: str, actor_role: str, action: str, target_id: str = None, meta: dict = None):
    """
    Append a tamper-evident audit entry to the `audit_logs` collection.

    Parameters
    ----------
    db          : PyMongo database handle
    actor_id    : str  – ObjectId of the user performing the action
    actor_role  : str  – "patient" | "doctor" | "admin"
    action      : str  – human-readable description, e.g. "DOCTOR_VIEW_RECORD"
    target_id   : str  – ObjectId of the resource being acted on (optional)
    meta        : dict – any extra fields to store (optional)
    """
    entry = {
        "actor_id":   actor_id,
        "actor_role": actor_role,
        "action":     action,
        "target_id":  target_id,
        "timestamp":  datetime.now(timezone.utc),
        "meta":       meta or {},
    }
    db.audit_logs.insert_one(entry)
