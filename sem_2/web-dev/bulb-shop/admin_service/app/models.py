from sqlalchemy import Column, String, DateTime, UUID, func
from database import Base
import uuid

class Admin(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    login = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='manager')
    created_at = Column(DateTime, server_default=func.now())