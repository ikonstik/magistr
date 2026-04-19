from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AdminLogin(BaseModel):
    login: str
    password: str

class AdminResponse(BaseModel):
    id: UUID
    login: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    token: str
    role: str
    expires_in: int