-- Лаба 3: целевая таблица агрегатов
CREATE TABLE shop.daily_category_stats
(
    day       Date,
    category  LowCardinality(String),
    views     UInt64,
    purchases UInt64,
    revenue   UInt64
)
ENGINE = SummingMergeTree
ORDER BY (day, category);

-- Материализованное представление: триггер на INSERT в events
CREATE MATERIALIZED VIEW shop.daily_category_stats_mv TO shop.daily_category_stats AS
SELECT
    toDate(event_time) AS day,
    category,
    countIf(event_type = 'page_view') AS views,
    countIf(event_type = 'purchase') AS purchases,
    sumIf(price, event_type = 'purchase') AS revenue
FROM shop.events
GROUP BY day, category;

-- Историю MV не видит: заполняем вручную
INSERT INTO shop.daily_category_stats
SELECT
    toDate(event_time) AS day,
    category,
    countIf(event_type = 'page_view') AS views,
    countIf(event_type = 'purchase') AS purchases,
    sumIf(price, event_type = 'purchase') AS revenue
FROM shop.events
GROUP BY day, category;

-- Проверка: новые события попадают в агрегат автоматически
INSERT INTO shop.events VALUES
    ('2025-10-01 12:00:00', 1, 1, 'page_view', 10, 'books', 500, 'mobile', 'Москва', 'direct'),
    ('2025-10-01 12:01:00', 1, 1, 'purchase',  10, 'books', 500, 'mobile', 'Москва', 'direct');

SELECT day, category, sum(views) AS views, sum(purchases) AS purchases, sum(revenue) AS revenue
FROM shop.daily_category_stats
WHERE day = '2025-10-01'
GROUP BY day, category;

-- Тот же отчёт по сырым данным и по агрегату
SELECT category, sumIf(price, event_type = 'purchase') AS revenue
FROM shop.events
GROUP BY category
ORDER BY revenue DESC;

SELECT category, sum(revenue) AS revenue
FROM shop.daily_category_stats
GROUP BY category
ORDER BY revenue DESC;

SYSTEM FLUSH LOGS;
SELECT substring(query, 1, 70) AS query, read_rows, formatReadableSize(read_bytes) AS read, query_duration_ms AS ms
FROM system.query_log
WHERE type = 'QueryFinish' AND query_kind = 'Select' AND query NOT LIKE '%system.%'
ORDER BY event_time_microseconds DESC
LIMIT 2;

-- Уборка: удаляем тестовую партицию
ALTER TABLE shop.events DROP PARTITION 202510;
ALTER TABLE shop.daily_category_stats DELETE WHERE day = '2025-10-01' SETTINGS mutations_sync = 1;
