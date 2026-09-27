from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import AppUser
from app.routers.deps import get_current_user
from app.schemas.auth import LoginRequest, Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AppUser:
    existing = db.query(AppUser).filter(
        or_(AppUser.email == payload.email, AppUser.username == payload.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    user = AppUser(
        email=payload.email,
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.query(AppUser).filter(
        or_(AppUser.email == payload.username_or_email, AppUser.username == payload.username_or_email)
    ).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username/email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    token = create_access_token(user.email)
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(current_user: AppUser = Depends(get_current_user)) -> AppUser:
    return current_user
