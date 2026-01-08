# Suraksha
Suraksha is an AI-powered safety platform for tourists. It features real-time geofencing, ML-based risk heatmaps, and a blockchain-backed SOS system for tamper-proof reporting. Designed to bridge the gap between travelers and authorities, it ensures rapid emergency response and proactive alerts, even in offline zones. 🛡️✈️
# Suraksha - Safety & Emergency Response App

Suraksha is a full-stack safety application designed to provide rapid emergency assistance. It features a React dashboard with real-time maps and a FastAPI backend secured with JWT authentication.

## 🚀 Features
- **User Authentication:** Secure Registration and Login with JWT.
- **SOS System:** One-click emergency alerts with location tracking.
- **Real-time Maps:** Leaflet integration for tracking safety services.
- **Modern UI:** Built with React 18, Vite, and Tailwind CSS 4.

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Lucide Icons, Leaflet.
- **Backend:** FastAPI (Python), SQLAlchemy, Pydantic.
- **Database:** SQLite (Development).

## 📋 Installation

### Backend Setup
1. Navigate to the server directory: `cd server`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `..\venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file based on the environment section below.
6. Start the server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the client directory: `cd client`
2. Install packages: `npm install`
3. Start the dev server: `npm run dev`

## 🔐 Environment Variables
Create a `.env` file in the `server` folder:
- `DATABASE_URL`: sqlite:///./suraksha.db
- `SECRET_KEY`: Your secret key
- `ALGORITHM`: HS256
- `SMTP_USER`: Your Gmail
- `SMTP_PASSWORD`: Your Gmail App Password
