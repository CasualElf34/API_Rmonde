from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RecipeBase(BaseModel):
    name: str
    description: str
    ingredients: str  # JSON format: ["ingredient1", "ingredient2"]
    instructions: str
    cuisine: Optional[str] = None
    dish_type: Optional[str] = "Plat"  # Entrée, Plat, Dessert
    dietary_type: Optional[str] = "Normal"  # Végétarien, Sans gluten, Normal
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: int = 4
    difficulty: Optional[str] = "Moyen"  # Facile, Moyen, Difficile


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    cuisine: Optional[str] = None
    dish_type: Optional[str] = None
    dietary_type: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[str] = None
    rating: Optional[float] = None
    is_published: Optional[bool] = None


class Recipe(RecipeBase):
    id: int
    rating: float
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
