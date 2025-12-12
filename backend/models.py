from sqlmodel import SQLModel, Field
from pydantic import EmailStr

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(primary_key=True, default=None)
    clerk_id: str = Field(unique=True, index=True)
    email: EmailStr | None = Field(default=None, index=True)
    username: str | None = Field(default=None)
    total_score: int = Field(default=0)
    level: str = Field(default="A1")


class Word(SQLModel, table=True):
    id: int | None = Field(primary_key=True, default=None)
    tr: str = Field(index=True)
    en: str = Field(index=True)

import datetime

class DailyStats(SQLModel, table=True):
    id: int | None = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="users.id", index=True)
    date: datetime.date = Field(index=True)
    quizzes_completed: int = Field(default=0)
    daily_score: int = Field(default=0)
    