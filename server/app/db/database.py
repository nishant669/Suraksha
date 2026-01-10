import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

# 1. Get the DATABASE_URL from Render Environment Variables
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Fix for SQLAlchemy (ensures 'postgresql' prefix)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Create the Engine
# NullPool is required because Supabase handles the pooling on Port 6543
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    connect_args={"sslmode": "require"} # This matches your Supabase setting
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- THIS IS THE MISSING PIECE ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ---------------------------------