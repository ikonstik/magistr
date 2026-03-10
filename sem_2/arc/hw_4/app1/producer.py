import json
import os
import sys
from fastapi import FastAPI, Depends
from kafka import KafkaProducer
from pydantic import BaseModel
from database.db_app import get_db, Error, AsyncSessionLocal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.append('/app')
class Message(BaseModel):
    code: int
    message: str
    details: str

producer_app = FastAPI()

KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka:9092")

producer = None


def get_producer():
    global producer
    if producer is None:
        producer = KafkaProducer(
            bootstrap_servers=KAFKA_SERVER,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    return producer


@producer_app.post("/send_message/{topic}")
async def send_message_to_kafka(message: Message, topic: str):
    mes_to_send = message.dict()

    try:
        kafka_producer = get_producer()
        future = kafka_producer.send(topic, value=mes_to_send)
        result = future.get(timeout=10)

        return {
            "code": 200,
            "partition": result.partition,
            "offset": result.offset
        }

    except Exception as e:
        return {"error": str(e)}

@producer_app.get("/errors")
async def get_errors(db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(select(Error))
        errors = res.scalars().all()
        return [
            {
                "id": e.id,
                "time": e.time,
                "code": e.code,
                "message": e.message,
                "details": e.details
            }
            for e in errors
        ]
    except Exception as e:
        return {"error": str(e)}


@producer_app.get("/")
async def root():
    return {"message": "Producer working", "kafka_server": KAFKA_SERVER}


@producer_app.on_event("shutdown")
async def shutdown():
    global producer
    if producer:
        producer.close()