-- Лаба 2: справочник товаров, который обновляется
CREATE TABLE shop.products
(
    product_id UInt32,
    name       String,
    price      UInt32,
    updated_at DateTime
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY product_id;

INSERT INTO shop.products VALUES
    (1, 'Ноутбук', 50000, '2025-09-01 10:00:00'),
    (2, 'Книга',     500, '2025-09-01 10:00:00');

-- Цена ноутбука изменилась: вставляем новую версию строки
INSERT INTO shop.products VALUES
    (1, 'Ноутбук', 45000, '2025-09-10 12:00:00');

-- Обе версии ещё на диске
SELECT * FROM shop.products ORDER BY product_id, updated_at;

-- FINAL схлопывает версии при чтении
SELECT * FROM shop.products FINAL ORDER BY product_id;

-- Принудительное слияние
OPTIMIZE TABLE shop.products FINAL;
SELECT * FROM shop.products ORDER BY product_id;

-- Лаба 2: счётчики, которые складываются сами
CREATE TABLE shop.daily_counters
(
    day        Date,
    event_type LowCardinality(String),
    events     UInt64
)
ENGINE = SummingMergeTree
ORDER BY (day, event_type);

INSERT INTO shop.daily_counters VALUES ('2025-10-01', 'page_view', 100), ('2025-10-01', 'purchase', 3);
INSERT INTO shop.daily_counters VALUES ('2025-10-01', 'page_view', 50);

-- До слияния строки лежат отдельно
SELECT * FROM shop.daily_counters ORDER BY day, event_type;

-- Правильный способ читать: всегда агрегировать
SELECT day, event_type, sum(events) AS events
FROM shop.daily_counters
GROUP BY day, event_type
ORDER BY day, event_type;

OPTIMIZE TABLE shop.daily_counters FINAL;
SELECT * FROM shop.daily_counters ORDER BY day, event_type;

-- Мутации: UPDATE и DELETE существуют, но это тяжёлая фоновая операция
ALTER TABLE shop.products UPDATE price = 40000 WHERE product_id = 1 SETTINGS mutations_sync = 1;
SELECT * FROM shop.products FINAL ORDER BY product_id;
SELECT command, is_done FROM system.mutations WHERE database = 'shop' AND table = 'products';
