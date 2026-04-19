CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем админа с правильным хешем (пароль: admin123)
INSERT INTO admins (login, password_hash, role) 
VALUES (
    'admin@bulbshop.ru', 
    '$2a$12$7B9gyWeEenvwnT4M3OgiEOJ3ZXsydSLShkrW.cz5qBbqhB.xzmKqy', 
    'admin'
);
