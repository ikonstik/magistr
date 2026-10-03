CREATE DATABASE IF NOT EXISTS shop;

CREATE TABLE IF NOT EXISTS shop.events
(
    event_time  DateTime,
    user_id     UInt32,
    session_id  UInt64,
    event_type  LowCardinality(String),
    product_id  UInt32,
    category    LowCardinality(String),
    price       UInt32,
    device      LowCardinality(String),
    city        LowCardinality(String),
    referrer    LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY event_time;
