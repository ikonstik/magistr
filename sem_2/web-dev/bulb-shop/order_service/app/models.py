from sqlalchemy import Column, String, DateTime, UUID, Integer, Numeric, Text, func, Enum
from database import Base
import uuid

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tracking_code = Column(String(20), unique=True, nullable=False)
    customer_first_name = Column(String(50), nullable=False)
    customer_last_name = Column(String(50), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(200), nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_method = Column(Enum('СДЭК', 'Почта России', 'Курьер', 'Самовывоз', name='delivery_method_enum'), nullable=False)
    payment_method = Column(Enum('онлайн', 'наличные', 'карта при получении', name='payment_method_enum'), nullable=False)
    status = Column(Enum('создан', 'на сборке', 'доставляется', 'доставлен', 'отменен', name='order_status_enum'), nullable=False, default='создан')
    total = Column(Numeric(10,2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), nullable=False)
    product_id = Column(UUID(as_uuid=True), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10,2), nullable=False)

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(Enum('создан', 'на сборке', 'доставляется', 'доставлен', 'отменен', name='order_status_enum'), nullable=False)
    location = Column(String(255))
    changed_at = Column(DateTime, server_default=func.now())