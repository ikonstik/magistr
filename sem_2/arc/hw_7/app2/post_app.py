from datetime import datetime

import os

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError, jwt

from database.db_app import get_db, Message, User

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"

app = FastAPI(title="Posts Service")

class PostCreate(BaseModel):
    message: str

class TokenData(BaseModel):
    user_id: int

async def verify_token_from_cookie(request: Request):
    """
    Получает и верифицирует JWT токен из cookie
    """
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. No access token found in cookies.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            options={"verify_exp": True}
        )
        
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return user_id
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature or malformed token"
        )

async def save_message(db: AsyncSession, user_id: int, message_text: str):
    """
    Сохраняет сообщение в таблицу messages
    """
    message = Message(
        user_id=user_id,
        message=message_text,
        time=datetime.utcnow()
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message

async def get_user_by_id(db: AsyncSession, user_id: int):

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

@app.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_token_from_cookie)
):
    try:
        user = await get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        await save_message(db, user_id, post_data.message)
        
        return JSONResponse(status_code=status.HTTP_201_CREATED, content={})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error saving message: {str(e)}"
        )
