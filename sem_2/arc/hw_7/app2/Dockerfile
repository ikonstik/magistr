FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY database ./database
COPY app2/post_app.py .

ENV PYTHONPATH=/app

CMD ["uvicorn", "post_app:app", "--host", "0.0.0.0", "--port", "8001"]
