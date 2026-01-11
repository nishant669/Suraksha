import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

# 1. Load variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Validation check
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file!")

# 3. Handle Render/Heroku 'postgres://' prefix
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 4. Create Engine (Using 6543 Port requires NullPool)
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()