"""
AES-256-GCM encryption / decryption helpers for medical record data.

Key must be exactly 32 bytes (256 bits). Store it base-64-encoded in
the AES_ENCRYPTION_KEY environment variable.

Usage:
    from utils.crypto import encrypt_text, decrypt_text
    ciphertext = encrypt_text("Diagnosis: hypertension")
    plaintext  = decrypt_text(ciphertext)
"""

import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Load key once at import time
_raw_key = os.getenv("AES_ENCRYPTION_KEY", "")
try:
    _KEY = base64.b64decode(_raw_key) if _raw_key else os.urandom(32)
except Exception:
    _KEY = os.urandom(32)   # fallback — NOT safe for production


def encrypt_text(plaintext: str) -> str:
    """
    Encrypt *plaintext* using AES-256-GCM.
    Returns a base-64 string: nonce(12B) + ciphertext + tag(16B).
    """
    aesgcm = AESGCM(_KEY)
    nonce  = os.urandom(12)
    ct     = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ct).decode()


def decrypt_text(b64_blob: str) -> str:
    """
    Decrypt a base-64-encoded AES-256-GCM blob produced by *encrypt_text*.
    Returns the original plaintext string.
    Raises ValueError if the blob is tampered or the key is wrong.
    """
    aesgcm = AESGCM(_KEY)
    raw    = base64.b64decode(b64_blob)
    nonce  = raw[:12]
    ct     = raw[12:]
    return aesgcm.decrypt(nonce, ct, None).decode()
