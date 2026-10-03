INSERT INTO shop.events
SELECT
    event_time,
    user_id,
    cityHash64(user_id, toStartOfHour(event_time)) AS session_id,
    multiIf(r_type < 70, 'page_view', r_type < 85, 'add_to_cart', r_type < 100 - purchase_pct, 'checkout', 'purchase') AS event_type,
    product_id,
    category,
    toUInt32((product_id * 37 % 200 + 1) * 50 * multiIf(category = 'electronics', 5, category = 'home', 2, 1)) AS price,
    device,
    city,
    referrer
FROM
(
    SELECT
        toDateTime('2025-09-01 00:00:00') + intDiv(number * 2592000, 12000000) AS event_time,
        toDate(event_time) = '2025-09-15' AS is_sale_day,
        toUInt32(cityHash64(number, 1) % 200000 + 1) AS user_id,
        toUInt32(cityHash64(number, 3) % 5000 + 1) AS product_id,
        ['electronics', 'books', 'clothes', 'home', 'sport', 'toys', 'beauty', 'food'][product_id % 8 + 1] AS category,
        cityHash64(user_id, 4) % 100 AS r_device,
        multiIf(r_device < 55, 'mobile', r_device < 95, 'desktop', 'tablet') AS device,
        multiIf(device = 'mobile', 4, device = 'desktop', 7, 5) * if(is_sale_day, 2, 1) AS purchase_pct,
        cityHash64(number, 2) % 100 AS r_type,
        cityHash64(user_id, 5) % 100 AS r_city,
        multiIf(
            r_city < 30, 'Москва',
            r_city < 45, 'Санкт-Петербург',
            r_city < 55, 'Новосибирск',
            r_city < 64, 'Екатеринбург',
            r_city < 72, 'Казань',
            r_city < 79, 'Нижний Новгород',
            r_city < 86, 'Краснодар',
            r_city < 92, 'Самара',
            r_city < 96, 'Уфа',
            'Пермь') AS city,
        cityHash64(number, 6) % 100 AS r_ref,
        multiIf(r_ref < 40, 'direct', r_ref < 65, 'yandex', r_ref < 80, 'google', r_ref < 92, 'telegram', 'vk') AS referrer,
        toHour(event_time) AS hour,
        multiIf(hour < 6, 10, hour < 9, 25, hour < 18, 40, hour < 23, 50, 25) AS base_weight,
        base_weight * if(is_sale_day, 2, 1) AS weight
    FROM numbers(12000000)
    WHERE cityHash64(number, 9) % 100 < weight
);
