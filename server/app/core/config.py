from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Core Security
    SECRET_KEY: str = "your_default_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # MUST match the .env key exactly

    # Database
    DATABASE_URL: str = "mysql+pymysql://root:@localhost/suraksha_db"
    
    # Email / SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False # Helps with Windows/Linux environment differences
        extra = "ignore"       # Prevents crashing if .env has extra items

settings = Settings()