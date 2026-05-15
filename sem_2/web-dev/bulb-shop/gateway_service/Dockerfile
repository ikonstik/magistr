FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app
COPY ./init_db.sql /docker-entrypoint-initdb.d/init.sql

CMD ["sh", "-c", "python -c \"from database import engine, Base; Base.metadata.create_all(bind=engine)\" && uvicorn main:app --host 0.0.0.0 --port 8003 --reload"]