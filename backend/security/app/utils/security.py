from datetime import datetime, timedelta
from typing import Optional
import jwt
from backend.security.app.utils.config import settings
from passlib.context import CryptContext
import hashlib


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def verify_password(plain_password, hashed_password):
#     return pwd_context.verify(plain_password, hashed_password)

# def get_password_hash(password):
#     return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Hash the password first with SHA256, then use bcrypt
    # This avoids the 72-byte limitation
    password_bytes = plain_password.encode('utf-8')
    
    # If password is too long, hash it first
    if len(password_bytes) > 72:
        # Use SHA256 to reduce the size
        sha256_hash = hashlib.sha256(password_bytes).hexdigest()
        return pwd_context.verify(sha256_hash, hashed_password)
    
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    
    # If password is too long, hash it first
    if len(password_bytes) > 72:
        # Use SHA256 to reduce the size
        password = hashlib.sha256(password_bytes).hexdigest()
    
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a refresh token with longer expiration.
    
    Args:
        data: Payload data (typically user ID, email, etc.)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT refresh token
    """
    to_encode = data.copy()
    
    # Remove sensitive data from refresh token
    # Keep only essential info like user ID
    minimal_data = {
        "sub": data.get("sub"),  # Subject (usually user ID)
        "type": "refresh"  # Token type
    }
    
    # Add optional claims if present
    if "email" in data:
        minimal_data["email"] = data["email"]
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default refresh token expiration (e.g., 7 days)
        expire = datetime.utcnow() + timedelta(days=7)
    
    minimal_data.update({"exp": expire})
    
    # Optionally use a different secret key for refresh tokens
    secret_key = settings.REFRESH_SECRET_KEY if hasattr(settings, 'REFRESH_SECRET_KEY') else settings.SECRET_KEY
    
    encoded_jwt = jwt.encode(minimal_data, secret_key, algorithm=settings.ALGORITHM)
    return encoded_jwt

def test_password_hashing():
    plain_password = "superduper"
    hashed_password = get_password_hash(plain_password)
    assert verify_password(plain_password, hashed_password) == True
    assert verify_password("wrongpassword", hashed_password) == False

# test_password_hashing()