from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, String
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:pass@postgres:5432/postgres")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

class Error(Base):
    __tablename__ = "errors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    time = Column(DateTime, default=datetime.utcnow)
    code = Column(Integer, index=True, nullable=False)
    message = Column(String, nullable=False)
    details = Column(String, nullable=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)