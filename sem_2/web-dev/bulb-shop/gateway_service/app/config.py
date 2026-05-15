import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL", "postgresql://admin_user:admin_pass@admin_db:5432/admin_db"
    )

    # Service URLs
    PRODUCT_SERVICE_URL = os.getenv(
        "PRODUCT_SERVICE_URL", "http://product_service:8000"
    )
    ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://order_service:8000")

    # Gateway port
    GATEWAY_PORT = int(os.getenv("GATEWAY_PORT", "8003"))


config = Config()
