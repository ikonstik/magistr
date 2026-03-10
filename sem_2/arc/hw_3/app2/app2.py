from fastapi import FastAPI
import httpx
from fastapi.responses import JSONResponse
import os

app = FastAPI()

APP1_HOST = os.getenv("APP1_HOST", "app1")
APP1_PORT = os.getenv("APP1_PORT", "8000")
APP1_URL = f"http://{APP1_HOST}:{APP1_PORT}"

@app.get("/", summary="Application 2")
async def proxy():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(APP1_URL)
            return JSONResponse(content=response.json())
        except Exception as e:
            return JSONResponse(
                content={"error": str(e)},
                status_code=500
            )
