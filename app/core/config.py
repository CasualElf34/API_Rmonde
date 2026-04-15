from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recipes.db")
    SECRET_KEY: str = "your-secret-key-here-change-in-production-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    class Config:
        env_file = ".env"


settings = Settings()

# Sur Vercel et Railway (environnements serverless), seul /tmp est accessible en écriture
if settings.DATABASE_URL.startswith("sqlite:///./") and not os.path.exists("recipes.db"):
    settings.DATABASE_URL = "sqlite:////tmp/recipes.db"
elif os.getenv("VERCEL") or os.getenv("RAILWAY_ENVIRONMENT"):
    if settings.DATABASE_URL.startswith("sqlite:///./"):
        settings.DATABASE_URL = "sqlite:////tmp/recipes.db"
