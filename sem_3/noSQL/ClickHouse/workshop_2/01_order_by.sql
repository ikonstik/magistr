-- Как данные лежат на диске: парты, гранулы, размер
SELECT partition, name, rows, marks, formatReadableSize(bytes_on_disk) AS size
FROM system.parts
WHERE database = 'shop' AND table = 'events' AND active
ORDER BY partition;

-- Сжатие по колонкам: колоночное хранение в цифрах
SELECT
    name,
    type,
    formatReadableSize(data_uncompressed_bytes) AS raw,
    formatReadableSize(data_compressed_bytes) AS compressed,
    round(data_uncompressed_bytes / data_compressed_bytes, 1) AS ratio
FROM system.columns
WHERE database = 'shop' AND table = 'events'
ORDER BY data_uncompressed_bytes DESC;

-- Лаба 1: та же таблица, другой ключ сортировки
CREATE TABLE shop.events_by_user
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (user_id, event_time)
AS SELECT * FROM shop.events;

-- Лаба 1: история одного пользователя
SELECT count() AS events, min(event_time) AS first_seen, max(event_time) AS last_seen
FROM shop.events
WHERE user_id = 777
SETTINGS use_query_condition_cache = 0;

SELECT count() AS events, min(event_time) AS first_seen, max(event_time) AS last_seen
FROM shop.events_by_user
WHERE user_id = 777
SETTINGS use_query_condition_cache = 0;

-- Лаба 1: а вот запрос за день теперь читает больше
SELECT uniq(user_id) AS dau
FROM shop.events
WHERE event_time >= '2025-09-15' AND event_time < '2025-09-16'
SETTINGS use_query_condition_cache = 0;

SELECT uniq(user_id) AS dau
FROM shop.events_by_user
WHERE event_time >= '2025-09-15' AND event_time < '2025-09-16'
SETTINGS use_query_condition_cache = 0;

SYSTEM FLUSH LOGS;
SELECT substring(query, 1, 70) AS query, read_rows, formatReadableSize(read_bytes) AS read, query_duration_ms AS ms
FROM system.query_log
WHERE type = 'QueryFinish' AND query_kind = 'Select' AND query NOT LIKE '%system.%'
ORDER BY event_time_microseconds DESC
LIMIT 4;

EXPLAIN indexes = 1
SELECT count() FROM shop.events_by_user WHERE user_id = 777;
