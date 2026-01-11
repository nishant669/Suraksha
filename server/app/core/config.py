from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Core Security
    SECRET_KEY: str = "your_default_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database (Default local, but Render Env Var overrides this automatically)
    DATABASE_URL: str = "sqlite:///./suraksha.db"
    
    # External APIs (New)
    NEWS_API_KEY: Optional[str] = None

    # Email / SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

settings = Settings()