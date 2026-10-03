-- Лаба 2, вопрос 1: самый нагруженный день и во сколько раз он больше обычного
SELECT
    toDate(event_time) AS day,
    count() AS events,
    round(events / avg(events) OVER (), 2) AS vs_average
FROM shop.events
GROUP BY day
ORDER BY events DESC
LIMIT 3;

-- Лаба 2, вопрос 2: топ-3 города по уникальным пользователям
SELECT city, uniq(user_id) AS users
FROM shop.events
GROUP BY city
ORDER BY users DESC
LIMIT 3;

-- Лаба 2, вопрос 3: конверсия в покупку по устройствам
SELECT
    device,
    uniqIf(user_id, event_type = 'page_view') AS viewed,
    uniqIf(user_id, event_type = 'purchase') AS purchased,
    round(purchased * 100 / viewed, 2) AS conversion_pct
FROM shop.events
WHERE toDate(event_time) = '2025-09-10'
GROUP BY device
ORDER BY conversion_pct DESC;

-- Лаба 2, вопрос 4 (со звёздочкой): конверсия в день распродажи против обычного дня
SELECT
    toDate(event_time) AS day,
    uniqIf(user_id, event_type = 'page_view') AS viewed,
    uniqIf(user_id, event_type = 'purchase') AS purchased,
    round(purchased * 100 / viewed, 2) AS conversion_pct
FROM shop.events
WHERE toDate(event_time) IN ('2025-09-14', '2025-09-15', '2025-09-16')
GROUP BY day
ORDER BY day;

-- Лаба 2, вопрос 5 (со звёздочкой): лидер по числу покупок и лидер по выручке
SELECT category, countIf(event_type = 'purchase') AS purchases, sumIf(price, event_type = 'purchase') AS revenue
FROM shop.events
GROUP BY category
ORDER BY purchases DESC
LIMIT 3;

-- Лаба 3: фильтр по ключу сортировки читает мало
SELECT uniq(user_id) FROM shop.events WHERE event_time >= '2025-09-15' AND event_time < '2025-09-16'
SETTINGS use_query_condition_cache = 0;

-- Лаба 3: фильтр по колонке вне ключа сортировки читает всю таблицу
SELECT uniq(session_id) FROM shop.events WHERE user_id = 777
SETTINGS use_query_condition_cache = 0;

-- Лаба 3: как ClickHouse выбирает гранулы
EXPLAIN indexes = 1
SELECT count() FROM shop.events WHERE event_time >= '2025-09-15' AND event_time < '2025-09-16';

EXPLAIN indexes = 1
SELECT count() FROM shop.events WHERE user_id = 777;

-- Лаба 3: сколько строк прочитали последние запросы
SYSTEM FLUSH LOGS;
SELECT
    substring(query, 1, 80) AS query,
    read_rows,
    formatReadableSize(read_bytes) AS read,
    query_duration_ms AS ms
FROM system.query_log
WHERE type = 'QueryFinish' AND query_kind = 'Select' AND query NOT LIKE '%system.%'
ORDER BY event_time_microseconds DESC
LIMIT 5;
