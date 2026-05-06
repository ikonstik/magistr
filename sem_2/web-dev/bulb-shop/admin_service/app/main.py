from fastapi import FastAPI
from routes import router
from database import engine, Base

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Admin Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],   
)

# Создание таблиц
Base.metadata.create_all(bind=engine)

app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "admin_service"}