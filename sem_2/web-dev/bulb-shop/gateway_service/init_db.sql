CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Удаляем старых админов
DELETE FROM admins WHERE login IN ('admin@bulbshop.ru', 'manager@bulbshop.ru');

-- Вставляем админа с хешем SHA-256 (пароль: admin123)
INSERT INTO admins (login, password_hash, role) 
VALUES (
    'admin@bulbshop.ru', 
    'sha256$c4e7b552353393fa38e72458ff820321$32b60b8f1ab9a2a7dc522adc4c03d2a857900f87307fdb489367823f49f9ee6b', 
    'admin'
);
