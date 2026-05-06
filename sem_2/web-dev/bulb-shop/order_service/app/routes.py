from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from schemas import OrderCreate, OrderResponse, OrderStatusUpdate, OrderTrackingResponse, OrderListResponse, OrderItemResponse
from models import Order, OrderItem, OrderStatusHistory
from utils import get_current_admin, generate_tracking_code, add_status_history, check_stock, update_stock
from database import get_db
import os

router = APIRouter(prefix="/api/v1", tags=["Orders"])
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product_service:8000")

    
# Публичные эндпоинты
@router.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    
    # Проверка остатков через Product Service
    total_price, items_with_details = await check_stock(order_data)
    
    # Создание заказа
    tracking_code = generate_tracking_code()
    db_order = Order(
        tracking_code=tracking_code,
        customer_first_name=order_data.customer_first_name,
        customer_last_name=order_data.customer_last_name,
        customer_phone=order_data.customer_phone,
        customer_email=order_data.customer_email,
        delivery_address=order_data.delivery_address,
        delivery_method=order_data.delivery_method,
        payment_method=order_data.payment_method,
        status='создан',
        total=total_price
    )
    db.add(db_order)
    db.flush()
    
    # Создание позиций заказа
    for item in items_with_details:
        db_item = OrderItem(
            order_id=db_order.id,
            **item
        )
        db.add(db_item)
    
    # История статуса
    add_status_history(db, db_order.id, 'создан')
    
    # Резервирование товаров (обновление остатков)
    await update_stock(order_data)
    
    db.commit()
    db.refresh(db_order)
    
    # Формирование ответа
    order_items = db.query(OrderItem).filter(OrderItem.order_id == db_order.id).all()
    result = OrderResponse.model_validate(db_order)
    result.items = [OrderItemResponse.model_validate(item) for item in order_items]
    
    return result

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: Session = Depends(get_db)):
    order = await db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    result = OrderResponse.model_validate(order)
    result.items = [OrderItemResponse.model_validate(item) for item in items]
    
    return result

@router.get("/orders/track/{tracking_code}", response_model=OrderTrackingResponse)
async def track_order(tracking_code: str, db: Session = Depends(get_db)):
    order = await db.query(Order).filter(Order.tracking_code == tracking_code).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    history = db.query(OrderStatusHistory).filter(
        OrderStatusHistory.order_id == order.id
    ).order_by(OrderStatusHistory.changed_at).all()
    
    return OrderTrackingResponse(
        tracking_code=order.tracking_code,
        status=order.status,
        estimated_delivery=None,
        current_location=history[-1].location if history else None,
        history=[{"status": h.status, "location": h.location, "changed_at": h.changed_at.isoformat()} for h in history]
    )

# Админские эндпоинты
@router.get("/orders", response_model=OrderListResponse)
async def get_all_orders(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    total = await db.query(Order).count()
    orders = await db.query(Order).offset(offset).limit(limit).all()
    
    result_items = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        order_dict = OrderResponse.model_validate(order)
        order_dict.items = [OrderItemResponse.model_validate(item) for item in items]
        result_items.append(order_dict)
    
    return OrderListResponse(
        items=result_items,
        total=total,
        limit=limit,
        offset=offset
    )

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    valid_statuses = ['создан', 'на сборке', 'доставляется', 'доставлен', 'отменен']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(valid_statuses)}")
    
    order = await db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_update.status
    add_status_history(db, order.id, status_update.status, status_update.location)
    
    db.commit()
    db.refresh(order)
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    result = OrderResponse.model_validate(order)
    result.items = [OrderItemResponse.model_validate(item) for item in items]
    
    return result