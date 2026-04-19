import random
import httpx
import os
from jose import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from schemas import OrderCreate
from models import OrderStatusHistory

security = HTTPBearer()
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product_service:8000")

def verify_admin_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions. Admin or manager role required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return verify_admin_token(token)

def generate_tracking_code() -> str:
    return f"ORD-{random.randint(10000, 99999)}"

def add_status_history(db: Session, order_id, status: str, location: str = None):
    history = OrderStatusHistory(
        order_id=order_id,
        status=status,
        location=location
    )
    db.add(history)
    db.commit()

async def check_stock(order_data: OrderCreate):
    async with httpx.AsyncClient() as client:
        total_price = 0
        items_with_details = []
        
        for item in order_data.items:
            resp = await client.get(f"{PRODUCT_SERVICE_URL}/api/v1/products/{item.product_id}")
            if resp.status_code != 200:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            product = resp.json()
            if product['stock'] < item.quantity:
                raise HTTPException(
                    status_code=409,
                    detail=f"Insufficient stock for product {product['name']}. Available: {product['stock']}"
                )
            
            item_total = float(product['price']) * item.quantity
            total_price += item_total
            items_with_details.append({
                "product_id": item.product_id,
                "product_name": product['name'],
                "quantity": item.quantity,
                "price": product['price']
            })
            
        return total_price, items_with_details
    
async def update_stock(order_data: OrderCreate):
    async with httpx.AsyncClient() as client:
        for item in order_data.items:
            product_resp = await client.get(f"{PRODUCT_SERVICE_URL}/api/v1/products/{item.product_id}")
            product = product_resp.json()
            await client.patch(
                f"{PRODUCT_SERVICE_URL}/api/v1/products/{item.product_id}/stock",
                json={"stock": product['stock'] - item.quantity}
            )