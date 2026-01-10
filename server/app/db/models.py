from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True) # Matches the 'phone' in your form
    password = Column(String, nullable=False)
    type = Column(String, default="tourist")
    is_verified = Column(Boolean, default=True) # Note: Import Boolean from sqlalchemy
    # ... rest of your user columns

# ADD THIS CLASS: Ensure it is named exactly 'SOS'
class SOS(Base):
    __tablename__ = "sos_alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())