#!/usr/bin/env bash
# Необязательное демо для лектора: тот же датасет в PostgreSQL и в ClickHouse, один и тот же запрос.
# Требует запущенных контейнеров clickhouse (порт 8123) и postgres (см. docker-compose.yml, профиль compare).
set -euo pipefail

CH_PORT="${CH_PORT:-8123}"
CH_PASSWORD="${CH_PASSWORD:-workshop}"
PG_CONTAINER="${PG_CONTAINER:-postgres}"

echo "1/3 Выгружаем события из ClickHouse в CSV"
curl -s "http://localhost:${CH_PORT}/?password=${CH_PASSWORD}" --data-binary \
  "SELECT event_time, user_id, event_type, product_id, category, price, device, city, referrer FROM shop.events FORMAT CSV" \
  > /tmp/events.csv
wc -l /tmp/events.csv

echo "2/3 Загружаем CSV в PostgreSQL"
docker exec "${PG_CONTAINER}" psql -U postgres -q -c "DROP TABLE IF EXISTS events" -c \
  "CREATE TABLE events (event_time timestamp, user_id int, event_type text, product_id int, category text, price int, device text, city text, referrer text)"
docker exec -i "${PG_CONTAINER}" psql -U postgres -q -c "\copy events FROM STDIN CSV" < /tmp/events.csv
docker exec "${PG_CONTAINER}" psql -U postgres -q -c "CREATE INDEX ON events (event_time)" -c "ANALYZE events"

echo "3/3 Один и тот же запрос в обеих базах"
QUERY="SELECT category, sum(price) AS revenue FROM events WHERE event_type = 'purchase' GROUP BY category ORDER BY revenue DESC"
echo "--- PostgreSQL"
docker exec "${PG_CONTAINER}" psql -U postgres -c '\timing on' -c "${QUERY}" | tail -3
echo "--- ClickHouse"
curl -s "http://localhost:${CH_PORT}/?password=${CH_PASSWORD}" --data-binary "${QUERY/FROM events/FROM shop.events} FORMAT Null" \
  -w 'Time: %{time_total}s\n'
