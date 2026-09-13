import datetime
from sqlmodel import SQLModel, Field
from pydantic import EmailStr

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(primary_key=True, default=None)
    email: EmailStr = Field(unique=True, index=True, nullable=False)
    username: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    total_score: int = Field(default=0)
    level: str = Field(default="A1")
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))


class Word(SQLModel, table=True):
    __tablename__ = "words"
    id: int | None = Field(primary_key=True, default=None)
    tr: str = Field(index=True)
    en: str = Field(index=True)


class DailyStats(SQLModel, table=True):
    __tablename__ = "daily_stats"
    id: int | None = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="users.id", index=True)
    date: datetime.date = Field(index=True)
    quizzes_completed: int = Field(default=0)
    daily_score: int = Field(default=0)


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"
    id: int | None = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="users.id", index=True)
    jti: str = Field(unique=True, index=True)
    family_id: str = Field(index=True)
    is_revoked: bool = Field(default=False)
    expires_at: datetime.datetime = Field(index=True)
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    