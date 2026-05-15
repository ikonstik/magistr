import hashlib
import secrets
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config import config
from database import get_db
from models import Admin
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


def hash_password(password: str) -> str:
    """Хеширование пароля с помощью SHA-256 + соль"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode())
    return f"sha256${salt}${hash_obj.hexdigest()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    try:
        method, salt, hash_value = hashed_password.split("$")
        if method != "sha256":
            return False
        new_hash = hashlib.sha256((salt + plain_password).encode()).hexdigest()
        return secrets.compare_digest(new_hash, hash_value)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)


def verify_token(token: str, required_role: str = None):
    try:
        payload = jwt.decode(
            token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM]
        )
        if required_role and payload.get("role") not in [
            "admin",
            "manager",
            required_role,
        ]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    return verify_token(token, required_role="admin")


async def get_current_staff(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    return verify_token(token, required_role="staff")


def authenticate_admin(login: str, password: str, db: Session):
    """Аутентификация администратора"""
    logger.info(f"Looking for admin: {login}")

    admin = db.query(Admin).filter(Admin.login == login).first()

    if not admin:
        logger.warning(f"Admin not found: {login}")
        return None

    if not verify_password(password, admin.password_hash):
        logger.warning(f"Password mismatch for: {login}")
        return None

    logger.info(f"Authentication successful for: {login}")
    return admin
