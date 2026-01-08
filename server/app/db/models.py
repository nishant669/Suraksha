from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    password = Column(String, nullable=False)
    type = Column(String, default="tourist")  # Matches "type" used in main.py logic
    is_verified = Column(Boolean, default=False)
    blockchain_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SOS(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    message = Column(String, nullable=True)
    # Storing contacts as a JSON list to keep track of who was notified
    notified_contacts = Column(JSON, nullable=True) 
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())