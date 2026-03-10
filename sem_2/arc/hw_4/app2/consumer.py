import asyncio
import json
import threading
import os
import time
from kafka import KafkaConsumer
from fastapi import FastAPI
from datetime import datetime
import sys

sys.path.append('/app')

from database.db_app import Error, AsyncSessionLocal

KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka:9092")

consumer_app = FastAPI()

async def write_to_db(message):
    try:
        async with AsyncSessionLocal() as session:
            db_error = Error(
                code=message.get("code"),
                time=datetime.utcnow(),
                message=message.get("message"),
                details=message.get("details")
            )
            session.add(db_error)
            await session.commit()
    except Exception as e:
        print(e)


def create_consumer(topic):
    while True:
        try:
            consumer = KafkaConsumer(
                topic,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            print("Connected to Kafka")
            return consumer
        except Exception as e:
            print("Kafka not ready, retrying in 5 seconds...")
            time.sleep(5)


async def consume_messages(topic: str):
    consumer = create_consumer(topic)
    try:
        for message in consumer:
            await write_to_db(message.value)
    except Exception as e:
        print(e)
    finally:
        consumer.close()


def run_consumer_in_thread(topic: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(consume_messages(topic))

@consumer_app.on_event("startup")
async def startup():
    thread = threading.Thread(
        target=run_consumer_in_thread,
        args=("errors",),
        daemon=True
    )
    thread.start()

