from fastapi import FastAPI
from routes import router
from database import engine, Base

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Order Service", description="Управление заказами")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],   
)

Base.metadata.create_all(bind=engine)

app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "order_service"}