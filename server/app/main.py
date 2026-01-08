from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import random

# Modular Imports
from app.db.database import engine, get_db, Base
from app.db.models import User, SOS
from app.schemas.schemas import UserCreate, UserResponse, Token, UserLogin, SOSCreate, VerifyOTP
from app.core.auth import get_current_active_user, get_password_hash, create_access_token, verify_password
from app.core.config import settings

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Suraksha API")

# Fix 1: Inclusive CORS for Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows both localhost and 127.0.0.1
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTHENTICATION ROUTES ---

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    # Note: is_verified set to True for now to bypass OTP testing
    new_user = User(
        name=user.name, 
        email=user.email, 
        phone=user.phone, 
        password=hashed_pwd, 
        type=user.type, 
        is_verified=True 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- USER ROUTES ---

# Fix 2: Added the Profile route that the Frontend needs
@app.get("/api/user/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

# --- SOS ROUTES ---

@app.post("/api/sos/create")
async def create_sos(sos: SOSCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    new_sos = SOS(
        user_id=current_user.id,
        latitude=sos.latitude,
        longitude=sos.longitude,
        message=sos.message,
        notified_contacts=sos.contacts
    )
    db.add(new_sos)
    db.commit()
    return {"status": "SOS Alert Sent", "id": new_sos.id}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}