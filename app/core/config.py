from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/recipes.db" if os.getenv("RAILWAY_ENVIRONMENT") else "sqlite:///./recipes.db"
    )
    SECRET_KEY: str = "your-secret-key-here-change-in-production-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
