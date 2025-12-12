from sqlmodel import SQLModel
from database import engine
from models import DailyStats

print("Creating tables (DailyStats only)...")
try:
    # Pass specific tables to create_all - this is supported by SQLAlchemy
    SQLModel.metadata.create_all(engine, tables=[DailyStats.__table__])
    print("Tables created successfully.")
except Exception as e:
    print(f"Error: {e}")
