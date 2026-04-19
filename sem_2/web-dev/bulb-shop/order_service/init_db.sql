CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE delivery_method_enum AS ENUM ('СДЭК', 'Почта России', 'Курьер', 'Самовывоз');
CREATE TYPE payment_method_enum AS ENUM ('онлайн', 'наличные', 'карта при получении');
CREATE TYPE order_status_enum AS ENUM ('создан', 'на сборке', 'доставляется', 'доставлен', 'отменен');

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code VARCHAR(20) UNIQUE NOT NULL,
    customer_first_name VARCHAR(50) NOT NULL,
    customer_last_name VARCHAR(50) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_method delivery_method_enum NOT NULL,
    payment_method payment_method_enum NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'создан',
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status_enum NOT NULL,
    location VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Функция для генерации tracking_code
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
BEGIN
    code := 'ORD-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    RETURN code;
END;
$$ LANGUAGE plpgsql;