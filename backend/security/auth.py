"""Authentication & authorization example."""

import os
from datetime import timedelta

import jwt
from jwt.exceptions import InvalidTokenError
from langgraph_sdk import Auth
from sqlalchemy.orm import Session
from backend.security.app.utils.dependencies import get_db  # Adjust import based on your project structure
from backend.security.app.models import User  # Adjust import based on your project structure
from fastapi import Depends, HTTPException
from backend.security.app.crud.user import  get_user_by_username
# Load your JWT secret from environment or settings
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-here")  # Use a strong secret!
ALGORITHM = os.environ.get("ALGORITHM", "HS256")


AUTH_EXCEPTION = Auth.exceptions.HTTPException(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

auth = Auth()



@auth.authenticate
async def get_current_user(
    authorization: str | None,  # "Bearer <token>"
    db: Session = Depends(get_db)  # Inject database session
) -> tuple[list[str], Auth.types.MinimalUserDict]:
    """Authenticate the user's JWT token."""
    if not authorization:
        raise AUTH_EXCEPTION
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.strip().split(" ", 1)
        if scheme.lower() != "bearer":
            raise AUTH_EXCEPTION

        # Decode and verify the JWT token
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},  # Remove if you have audience in token
            leeway=timedelta(seconds=60),
        )

        # Extract username from token payload
        username = payload.get("sub")
        if not username:
            raise AUTH_EXCEPTION

        # Fetch user from database
        user = get_user_by_username(db, username)
        if not user:
            raise AUTH_EXCEPTION

        # Extract scopes/roles from payload (adjust based on your token structure)
        scopes = [payload.get("role", "user")]  # Default to "user" role if not specified
        
        # You could also get scopes from user object in database
        # scopes = [user.role] if hasattr(user, 'role') else ["user"]

        return scopes, {
            "identity": str(user.id),  # Convert to string if needed
            "display_name": user.username,  # Or user.full_name if available
            "is_authenticated": True,
        }

    except (ValueError, InvalidTokenError, jwt.PyJWTError) as e:
        # Log the error for debugging
        print(f"Authentication error: {e}")
        raise AUTH_EXCEPTION from e
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected authentication error: {e}")
        raise AUTH_EXCEPTION