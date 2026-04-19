from fastapi import FastAPI
from routes import router
from database import engine, Base

app = FastAPI(title="Admin Service")

# Создание таблиц
Base.metadata.create_all(bind=engine)

app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "admin_service"}