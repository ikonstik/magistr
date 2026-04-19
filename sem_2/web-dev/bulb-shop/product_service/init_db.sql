CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE lamp_type AS ENUM ('LED', 'накаливания', 'люминесцентная', 'галогеновая');

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    type lamp_type NOT NULL,
    wattage INT NOT NULL,
    socket VARCHAR(20) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_price ON products(price);