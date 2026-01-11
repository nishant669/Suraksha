import os
import random
import requests
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# --- DATABASE SETUP ---
from app.db.database import engine, get_db, Base
from app.db.models import User, SOS
from app.schemas.schemas import UserCreate, UserResponse, Token, UserLogin, SOSCreate
from app.core.auth import get_current_active_user, get_password_hash, create_access_token, verify_password

# This ensures tables are created when the app starts up
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up (if needed) on shutdown

app = FastAPI(title="Suraksha API", lifespan=lifespan)

# CORS: Allows your Render Frontend URL to communicate with this Backend
# In server/app/main.py

# In server/app/main.py

# server/app/main.py

# server/app/main.py

# server/app/main.py

# server/app/main.py
# server/app/main.py


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- WEATHER ROUTE ---

@app.get("/api/weather")
async def get_weather(lat: float, lon: float):
    # We include both 'current' for the main widget and 'daily' for the 7-day outlook
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min&"
        f"timezone=auto"
    )
    
    # Mapping WMO weather codes to readable conditions for the Frontend
    weather_codes = {
        0: "Clear Sky",
        1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing Rime Fog",
        51: "Drizzle", 61: "Slight Rain", 71: "Slight Snow",
        95: "Thunderstorm"
    }

    try:
        response = requests.get(url)
        data = response.json()
        
        current = data.get("current", {})
        
        # We return a structured object that the React Frontend expects
        return {
            "temp": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "wind": current.get("wind_speed_10m"),
            "condition": weather_codes.get(current.get("weather_code"), "Cloudy"),
            # server_time helps sync the frontend clock
            "server_time": datetime.now().isoformat(),
            # daily provides the data for the 7-Day Outlook component
            "daily": data.get("daily") 
        }
    except Exception as e:
        print(f"Weather API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch weather data from provider")

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

@app.get("/api/user/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

# --- SOS ROUTES ---

@app.post("/api/sos/create")
async def create_sos(sos: SOSCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Log the emergency to the terminal
    print(f"🚨 EMERGENCY ALERT from {current_user.name} ({current_user.phone})")
    print(f"📍 Location: {sos.latitude}, {sos.longitude}")
    
    new_sos = SOS(
        user_id=current_user.id,
        latitude=sos.latitude,
        longitude=sos.longitude,
        message=sos.message,
        notified_contacts=sos.contacts
    )
    db.add(new_sos)
    db.commit()
    return {"status": "SOS Alert Sent successfully", "id": new_sos.id}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/sos/history")
async def get_sos_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    # This fetches only the alerts belonging to the logged-in user
    alerts = db.query(SOS).filter(SOS.user_id == current_user.id).order_by(SOS.created_at.desc()).all()
    return alerts
@app.get("/")
async def root():
    return {"message": "Suraksha API is active", "docs": "/docs"}

# --- NEW: SAFETY NEWS & COUNTRY DATA ---

# server/app/main.py
# server/app/main.py ke andar update karein
@app.get("/api/safety/news")
async def get_safety_news():
    # newsapi.org se free key le kar yahan daalein
    api_key = "PASTE_YOUR_REAL_NEWS_API_KEY_HERE" 
    # Humne query ko specifically safety aur travel alerts par rakha hai
    url = f"https://newsapi.org/v2/everything?q=travel+safety+india+accident+weather&sortBy=publishedAt&pageSize=5&apiKey={api_key}"
    try:
        response = requests.get(url)
        data = response.json()
        return data.get("articles", [])
    except Exception as e:
        print(f"News API Error: {e}")
        return []

@app.get("/api/country/info")
async def get_country_emergency(country_code: str):
    # REST Countries API (No key required)
    url = f"https://restcountries.com/v3.1/alpha/{country_code}"
    try:
        response = requests.get(url)
        data = response.json()[0]
        return {
            "name": data['name']['common'],
            "flag": data['flags']['svg'],
            # Note: REST Countries provides general info, we can map common numbers
            "emergency": {"police": "100", "ambulance": "108"} 
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch country data")