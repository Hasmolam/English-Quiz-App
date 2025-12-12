from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)
print("Tables:", inspector.get_table_names())
for table in inspector.get_table_names():
    print(f"\nIndexes for {table}:")
    for index in inspector.get_indexes(table):
        print(f"  - {index['name']}")
