import bcrypt
from passlib.context import CryptContext

# Явно указываем использовать bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Ограничиваем пароль 72 байтами
password = "admin123"[:72]
hash = pwd_context.hash(password)
print(f"Password: admin123")
print(f"Hash: {hash}")

# Проверка
print(f"Verification: {pwd_context.verify('admin123', hash)}")