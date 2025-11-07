import json
import uuid
from enum import Enum
import aiofiles
from datetime import date
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional
import uvicorn
import re


class TypeRequest(str, Enum):
    connection_status = "Loss Network connection"
    phone_status = "Phone is not working"
    email_status = "Emails are not coming or sending"


class SimpleRequestCreate(BaseModel):
    surname: str = Field(max_length=50)
    name: str = Field(max_length=50)
    birth_date: date
    phone_number: str = Field(max_length=11, min_length=10)
    email: EmailStr
    type: List[TypeRequest]
    appear_date: date
    text: str = Field(max_length=200)

    @field_validator("surname", "name", mode="before")
    @classmethod
    def name_surname_validator(cls, v: str) -> str:
        if not re.match(r"^[A-Za-zА-Яа-яёЁ\- \']+$", v):
            raise ValueError("Invalid field value")
        return v.title()

    @field_validator("phone_number", mode="before")
    @classmethod
    def phone_number_validator(cls, v: str) -> str:
        v = re.sub(r'[\s\-]', '', v)
        if not re.match(r"^[0-9]{10}$", v):
            raise ValueError("Phone number must contain exactly 10 digits")
        return v

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, v):
        if isinstance(v, str):
            return [v]
        return v


class SimpleRequestResponse(BaseModel):
    req_id: uuid.UUID
    surname: str
    name: str
    birth_date: date
    phone_number: str
    email: EmailStr
    created_at: date
    type: List[TypeRequest]
    appear_date: date
    text: str


DATA_FILE = "requests_library.json"


async def read_data() -> List[dict]:
    try:
        async with aiofiles.open(DATA_FILE, "r", encoding="utf-8") as file:
            content = await file.read()
            if content:
                data = json.loads(content)
                for item in data:
                    if 'req_id' in item:
                        item['req_id'] = uuid.UUID(item['req_id'])
                    if 'type' in item:
                        if isinstance(item['type'], str):
                            item['type'] = [TypeRequest(item['type'])]
                        elif isinstance(item['type'], list):
                            item['type'] = [TypeRequest(t) if isinstance(t, str) else t for t in item['type']]
                return data
            return []
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []


async def write_data(requests: List[dict]) -> None:
    serializable_requests = []
    for req in requests:
        req_dict = req.copy() if isinstance(req, dict) else req.dict()
        req_dict['req_id'] = str(req_dict['req_id'])

        if 'type' in req_dict and isinstance(req_dict['type'], list):
            req_dict['type'] = [t.value if isinstance(t, TypeRequest) else t for t in req_dict['type']]

        for date_field in ['birth_date', 'created_at', 'appear_date']:
            if date_field in req_dict and hasattr(req_dict[date_field], 'isoformat'):
                req_dict[date_field] = req_dict[date_field].isoformat()
            elif date_field in req_dict and isinstance(req_dict[date_field], str):
                continue
        serializable_requests.append(req_dict)

    async with aiofiles.open(DATA_FILE, "w", encoding="utf-8") as file:
        await file.write(json.dumps(serializable_requests, ensure_ascii=False, indent=4))


app = FastAPI(title="Request collector")


@app.get("/")
async def read_root():
    return {"message": "Request collector"}


@app.get("/request-types/")
async def get_request_types():
    return {
        "available_types": [
            {"value": type.value, "description": type.name}
            for type in TypeRequest
        ]
    }


@app.post("/requests/", response_model=SimpleRequestResponse, description="Запись обращения в файл")
async def create_request(request: SimpleRequestCreate):
    try:
        requests = await read_data()

        new_req = SimpleRequestResponse(
            req_id=uuid.uuid4(),
            surname=request.surname,
            name=request.name,
            birth_date=request.birth_date,
            phone_number=request.phone_number,
            email=request.email,
            type=request.type,
            appear_date=request.appear_date,
            created_at=date.today(),
            text=request.text
        )

        requests.append(new_req.dict())
        await write_data(requests)

        return new_req

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.get("/requests/{req_id}", response_model=SimpleRequestResponse)
async def get_request_by_id(req_id: uuid.UUID):
    try:
        requests = await read_data()

        for req in requests:
            if req["req_id"] == req_id:
                return SimpleRequestResponse(**req)

        raise HTTPException(status_code=404, detail="Request not found")

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


@app.get("/requests/search/", response_model=List[SimpleRequestResponse])
async def search_requests(
        surname: Optional[str] = Query(None),
        name: Optional[str] = Query(None),
        type: Optional[List[TypeRequest]] = Query(None)
):
    try:
        requests = await read_data()
        filtered_requests = []

        for req in requests:
            if surname and req["surname"].lower() != surname.lower():
                continue
            if name and req["name"].lower() != name.lower():
                continue


            if type:
                common_types = set(req["type"]) & set(type)
                if not common_types:
                    continue

            filtered_requests.append(SimpleRequestResponse(**req))

        return filtered_requests

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.get("/requests/by-type/{request_type}", response_model=List[SimpleRequestResponse])
async def get_requests_by_type(request_type: TypeRequest):
    try:
        requests = await read_data()
        filtered_requests = [
            SimpleRequestResponse(**req)
            for req in requests
            if request_type in req["type"]
        ]
        return filtered_requests

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.get("/requests/by-types/", response_model=List[SimpleRequestResponse])
async def get_requests_by_multiple_types(
        types: List[TypeRequest] = Query(..., description="Список типов для поиска")
):
    try:
        requests = await read_data()
        filtered_requests = [
            SimpleRequestResponse(**req)
            for req in requests
            if all(t in req["type"] for t in types)
        ]
        return filtered_requests

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.get("/requests/contains-any-type/", response_model=List[SimpleRequestResponse])
async def get_requests_containing_any_type(
        types: List[TypeRequest] = Query(..., description="Список типов для поиска")
):
    try:
        requests = await read_data()
        filtered_requests = [
            SimpleRequestResponse(**req)
            for req in requests
            if any(t in req["type"] for t in types)
        ]
        return filtered_requests

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@app.get("/requests/", response_model=List[SimpleRequestResponse])
async def get_all_requests():
    requests = await read_data()
    return [SimpleRequestResponse(**req) for req in requests]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)