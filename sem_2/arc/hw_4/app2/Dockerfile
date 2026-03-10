FROM python:3.9-slim

WORKDIR /app

COPY ./requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app2/consumer.py .

ENV PYTHONPATH=/app

CMD ["uvicorn", "consumer:consumer_app", "--host", "0.0.0.0", "--port", "8001"]