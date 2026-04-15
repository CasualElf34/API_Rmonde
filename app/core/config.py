from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recipes.db")
    SECRET_KEY: str = "your-secret-key-here-change-in-production-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    class Config:
        env_file = ".env"


settings = Settings()

# Neon / PostgreSQL : convertit postgresql:// → postgresql+psycopg2:// pour SQLAlchemy
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif settings.DATABASE_URL.startswith("postgresql://") and "+psycopg2" not in settings.DATABASE_URL:
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Fallback SQLite /tmp uniquement si pas de DB persistante configurée
elif settings.DATABASE_URL.startswith("sqlite:///./"):
    if not os.path.exists("recipes.db"):
        settings.DATABASE_URL = "sqlite:////tmp/recipes.db"
    elif os.getenv("VERCEL") or os.getenv("RAILWAY_ENVIRONMENT"):
        settings.DATABASE_URL = "sqlite:////tmp/recipes.db"
