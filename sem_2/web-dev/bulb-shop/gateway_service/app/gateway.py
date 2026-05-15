import httpx
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from auth import get_current_admin, create_access_token, authenticate_admin
from config import config
from database import get_db


router = APIRouter()
client = httpx.AsyncClient(timeout=30.0)


# ==================== Models ====================
class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: str
    expires_in: int


# ==================== Auth Endpoints ====================
@router.post("/api/admin/login", response_model=LoginResponse)
def admin_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Аутентификация администратора"""
    admin = authenticate_admin(login_data.login, login_data.password, db)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login or password"
        )

    token = create_access_token(
        {"sub": admin.login, "role": admin.role, "admin_id": str(admin.id)}
    )

    return LoginResponse(
        token=token, role=admin.role, expires_in=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/api/admin/me")
def get_current_admin_info(admin=Depends(get_current_admin)):
    """Получение информации о текущем администраторе"""
    return {
        "login": admin.get("sub"),
        "role": admin.get("role"),
        "admin_id": admin.get("admin_id"),
    }


# ==================== Proxy Helper ====================
async def proxy_request(request: Request, target_url: str, token: str = None):
    """Проксирование запроса к целевому сервису"""
    try:
        headers = dict(request.headers)
        headers.pop("host", None)

        if token:
            headers["Authorization"] = f"Bearer {token}"

        body = await request.body()

        response = await client.request(
            method=request.method,
            url=f"{target_url}{request.url.path}",
            params=request.query_params,
            headers=headers,
            content=body if body else None,
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unavailable: {target_url}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


# ==================== Product Service (публичные) ====================
@router.api_route("/api/v1/products", methods=["GET"])
@router.api_route("/api/v1/products/{product_id}", methods=["GET"])
async def product_proxy_public(request: Request):
    """Публичные GET запросы к product service"""
    return await proxy_request(request, config.PRODUCT_SERVICE_URL)


# ==================== Product Service (админские) ====================
@router.api_route("/api/v1/products", methods=["POST", "PUT", "DELETE", "PATCH"])
@router.api_route("/api/v1/products/{product_id}", methods=["PUT", "DELETE", "PATCH"])
@router.api_route("/api/v1/products/{product_id}/stock", methods=["PATCH"])
async def product_proxy_admin(request: Request, admin=Depends(get_current_admin)):
    """Админские запросы к product service"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    return await proxy_request(request, config.PRODUCT_SERVICE_URL, token=token)


# ==================== Order Service (публичные) ====================
@router.api_route("/api/v1/orders", methods=["POST"])
@router.api_route("/api/v1/orders/{order_id}", methods=["GET"])
@router.api_route("/api/v1/orders/phone/{phone}", methods=["GET"])
@router.api_route("/api/v1/orders/track/{tracking_code}", methods=["GET"])
async def order_proxy_public(request: Request):
    """Публичные запросы к order service"""
    return await proxy_request(request, config.ORDER_SERVICE_URL)


# ==================== Order Service (админские) ====================
@router.api_route("/api/v1/orders", methods=["GET"])
@router.api_route("/api/v1/orders/{order_id}/status", methods=["PUT"])
async def order_proxy_admin(request: Request, admin=Depends(get_current_admin)):
    """Админские запросы к order service"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    return await proxy_request(request, config.ORDER_SERVICE_URL, token=token)


# ==================== Health Check ====================
@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "gateway_service"}


@router.get("/health/services")
async def services_health_check():
    """Проверка доступности сервисов"""
    services_status = {}

    for name, url in [
        ("product_service", config.PRODUCT_SERVICE_URL),
        ("order_service", config.ORDER_SERVICE_URL),
    ]:
        try:
            resp = await client.get(f"{url}/health")
            services_status[name] = resp.status_code == 200
        except:
            services_status[name] = False

    return services_status
