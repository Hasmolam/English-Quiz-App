from sqlmodel import SQLModel, Field
from pydantic import EmailStr

class User(SQLModel, table=True):
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
    