-- Сколько событий и пользователей
SELECT count() AS events, uniq(user_id) AS users, min(event_time) AS first_event, max(event_time) AS last_event
FROM shop.events;

-- Распределение по типам событий
SELECT event_type, count() AS events, round(events * 100 / sum(events) OVER (), 1) AS pct
FROM shop.events
GROUP BY event_type
ORDER BY events DESC;

-- Активность по дням
SELECT toDate(event_time) AS day, count() AS events, uniq(user_id) AS dau
FROM shop.events
GROUP BY day
ORDER BY day;

-- Трафик по часам
SELECT toHour(event_time) AS hour, count() AS events
FROM shop.events
GROUP BY hour
ORDER BY hour;

-- Выручка по категориям
SELECT
    category,
    countIf(event_type = 'purchase') AS purchases,
    sumIf(price, event_type = 'purchase') AS revenue,
    round(revenue / purchases) AS avg_check
FROM shop.events
GROUP BY category
ORDER BY revenue DESC;

-- Воронка за один день
SELECT
    uniqIf(user_id, event_type = 'page_view') AS viewed,
    uniqIf(user_id, event_type = 'add_to_cart') AS added_to_cart,
    uniqIf(user_id, event_type = 'purchase') AS purchased,
    round(purchased * 100 / viewed, 2) AS conversion_pct
FROM shop.events
WHERE toDate(event_time) = '2025-09-10';

-- Доля устройств
SELECT device, count() AS events, round(events * 100 / sum(events) OVER (), 1) AS pct
FROM shop.events
GROUP BY device
ORDER BY events DESC;
