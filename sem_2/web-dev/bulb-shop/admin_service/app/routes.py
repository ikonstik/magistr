from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import AdminLogin, TokenResponse
from models import Admin
from auth import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/login", response_model=TokenResponse)
def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.login == login_data.login).first()
    if not admin or not verify_password(login_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login or password"
        )
    token = create_access_token(
        data={"sub": admin.login, "role": admin.role, "admin_id": str(admin.id)}
    )
    return TokenResponse(
        token=token,
        role=admin.role,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )