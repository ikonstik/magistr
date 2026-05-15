from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gateway import router
from database import engine, Base
from config import config

app = FastAPI(
    title="API Gateway",
    description="Gateway with built-in authentication for Product and Order services",
    version="2.0.0",
)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=config.GATEWAY_PORT)
