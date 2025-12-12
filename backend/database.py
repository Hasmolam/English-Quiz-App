from sqlmodel import create_engine, SQLModel, Session
from fastapi import Depends
from typing import Annotated
from dotenv import load_dotenv
import os

load_dotenv()
SQLMODEL_DATABASE_URL = os.getenv("SQLMODEL_DATABASE_URL")

if not SQLMODEL_DATABASE_URL:
	raise ValueError("SQLMODEL_DATABASE_URL environment variable is not set")

engine = create_engine(SQLMODEL_DATABASE_URL, pool_pre_ping=True, echo=False)

def create_db_and_tables():
	SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session