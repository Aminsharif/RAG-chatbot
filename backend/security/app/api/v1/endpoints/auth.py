from fastapi import APIRouter, Depends, HTTPException, status, Form
# from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.security.app.utils.security import create_access_token, verify_password, create_refresh_token, get_password_hash
from backend.security.app.schemas.user import Token,LoginRequest, UserCreate, UserResponse, get_login_form
from backend.security.app.crud.user import get_user, create_user, get_user_by_username, get_user_by_email
from backend.security.app.utils.dependencies import get_db, permission_required
from backend.security.app.utils.config import settings
import logging
from datetime import datetime

router = APIRouter()

logger = logging.getLogger(__name__)



@router.post("/login", response_model=Token)
def login_for_access_token(login_data: LoginRequest,
    db: Session = Depends(get_db)):
    # user = get_user_by_username(db, form_data.username)
    # email = form_data["email"]
    # password = form_data["password"]
    logger.debug(f"Login attempt for user {login_data.email}")

    user = get_user_by_email(db,login_data.email)
    if not user:
        logger.warning("User not found")
    elif not verify_password(login_data.password, user.hashed_password):
        logger.warning("Password mismatch")
    
    # Additional debug information
    logger.debug(f"User from DB: {user}")
    logger.debug(f"Form data: {login_data.email}")
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_token = create_refresh_token(
        data={"sub": user.username}, expires_delta=refresh_token_expires
    )
    logger.info("Token created successfully")
    access_expires_at = datetime.utcnow() + access_token_expires
    return {"access_token": access_token, "refresh_token": refresh_token_token, "user": user, "expires_at": int(access_expires_at.timestamp())  }

@router.post("/create_user/", response_model=UserResponse)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    new_user = create_user(db=db, user=user)
    return UserResponse.model_validate(new_user)