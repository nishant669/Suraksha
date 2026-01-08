from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    type: str = "tourist"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel): # Changed to help validation
    id: int
    name: str
    email: str
    phone: str
    type: str
    is_verified: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ADD THESE MISSING CLASSES:
class SOSCreate(BaseModel):
    latitude: float
    longitude: float
    message: Optional[str] = "Emergency"
    contacts: List[str]

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str