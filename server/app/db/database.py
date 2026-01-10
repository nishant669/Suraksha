import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

# Read the URL from Render's dashboard
DATABASE_URL = os.getenv("DATABASE_URL")

# Production fix: Transaction Pooler requires NullPool (no local pooling)
engine = create_engine(
    DATABASE_URL, 
    poolclass=NullPool,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()