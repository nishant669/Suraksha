from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean # Added Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True) 
    password = Column(String, nullable=False)
    type = Column(String, default="tourist")
    is_verified = Column(Boolean, default=True) # Now Boolean is imported
class SOS(Base):
    __tablename__ = "sos_alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    message = Column(String)
    notified_contacts = Column(String) # Add this to match main.py
    created_at = Column(DateTime(timezone=True), server_default=func.now())