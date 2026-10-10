-- Лаба 4 (со звёздочкой): индекс пропуска данных для колонки вне ключа сортировки
SELECT count() FROM shop.events WHERE user_id = 777 SETTINGS use_query_condition_cache = 0;

ALTER TABLE shop.events ADD INDEX idx_user_id user_id TYPE bloom_filter GRANULARITY 1;
ALTER TABLE shop.events MATERIALIZE INDEX idx_user_id SETTINGS mutations_sync = 1;

SELECT count() FROM shop.events WHERE user_id = 777 SETTINGS use_query_condition_cache = 0;

SYSTEM FLUSH LOGS;
SELECT substring(query, 1, 70) AS query, read_rows, formatReadableSize(read_bytes) AS read, query_duration_ms AS ms
FROM system.query_log
WHERE type = 'QueryFinish' AND query_kind = 'Select' AND query NOT LIKE '%system.%'
ORDER BY event_time_microseconds DESC
LIMIT 2;

EXPLAIN indexes = 1
SELECT count() FROM shop.events WHERE user_id = 777 SETTINGS use_query_condition_cache = 0;

-- Сколько места занял индекс
SELECT name, type, formatReadableSize(data_compressed_bytes) AS size
FROM system.data_skipping_indices
WHERE database = 'shop' AND table = 'events';
