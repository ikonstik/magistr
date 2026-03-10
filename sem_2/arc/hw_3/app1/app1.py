from fastapi import FastAPI

app = FastAPI()

@app.get("/", summary="Application 1")
def home():
    return {"message": "Hello World"}
