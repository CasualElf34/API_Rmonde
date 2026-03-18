from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from datetime import datetime, timezone
from app.models.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    ingredients = Column(Text)  # JSON format: ["ingredient1", "ingredient2"]
    instructions = Column(Text)
    cuisine = Column(String, index=True)  # Pays/Région d'origine
    dish_type = Column(String, index=True)  # Entrée, Plat, Dessert
    dietary_type = Column(String, index=True)  # Végétarien, Sans gluten, Normal
    prep_time = Column(Integer, nullable=True)  # Minutes
    cook_time = Column(Integer, nullable=True)  # Minutes
    servings = Column(Integer, default=4)
    difficulty = Column(String)  # Facile, Moyen, Difficile
    rating = Column(Float, default=0.0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
