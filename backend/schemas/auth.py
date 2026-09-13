import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import datetime

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Kullanıcı adı en az 3 karakter olmalıdır.")
        if not re.match(r"^[a-zA-Z0-9_.-]+$", v):
            raise ValueError("Kullanıcı adı sadece harf, rakam, alt çizgi (_), nokta (.) veya tire (-) içerebilir.")
        return v

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

class UserLoginRequest(BaseModel):
    identifier: str = Field(..., min_length=1, description="Username or Email")
    password: str = Field(..., min_length=1)

    @field_validator('identifier')
    @classmethod
    def strip_identifier(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Giriş kimliği boş olamaz.")
        return v

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)

    @field_validator('refresh_token')
    @classmethod
    def strip_token(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Refresh token boş olamaz.")
        return v

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    total_score: int
    level: str
    created_at: datetime.datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
