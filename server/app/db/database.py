import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Logic to detect if we are on Render or Local
# Render uses the /data path for persistent disks
if os.path.exists("/data"):
    # Production path (Persistent Disk)
    DATABASE_URL = "sqlite:////data/suraksha.db"
else:
    # Local path (Your laptop)
    DATABASE_URL = settings.DATABASE_URL 

# 2. Create Engine
# Note: SQLite needs 'check_same_thread': False only for local multi-threading, 
# but it's safer to keep for SQLite generally.
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()