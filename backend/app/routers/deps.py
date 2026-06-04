from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import AppUser

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
from fastapi.security import HTTPBearer

oauth2_scheme = HTTPBearer()


def get_current_user( credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)) -> AppUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    try:
        payload = decode_token(token)
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(AppUser).filter(or_(AppUser.email == subject, AppUser.username == subject)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_admin(current_user: AppUser = Depends(get_current_user)) -> AppUser:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
