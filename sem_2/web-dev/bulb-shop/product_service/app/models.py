from sqlalchemy import Column, String, DateTime, UUID, Integer, Numeric, Text, func, Enum
from database import Base
import uuid

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10,2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    type = Column(Enum('LED', 'накаливания', 'люминесцентная', 'галогеновая', name='lamp_type'), nullable=False)
    wattage = Column(Integer, nullable=False)
    socket = Column(String(20), nullable=False)
    image_url = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())