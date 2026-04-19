from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    customer_first_name: str = Field(min_length=1)
    customer_last_name: str = Field(min_length=1)
    customer_phone: str = Field(min_length=10)
    customer_email: str
    delivery_address: str
    delivery_method: str
    payment_method: str
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    quantity: int
    price: Decimal
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    tracking_code: str
    customer_first_name: str
    customer_last_name: str
    customer_phone: str
    customer_email: str
    delivery_address: str
    delivery_method: str
    payment_method: str
    status: str
    total: Decimal
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    location: Optional[str] = None

class OrderTrackingResponse(BaseModel):
    tracking_code: str
    status: str
    estimated_delivery: Optional[str] = None
    current_location: Optional[str] = None
    history: List[dict]

class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    limit: int
    offset: int