from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime, timezone
from app.models.database import Base

class UserRecipeRating(Base):
    __tablename__ = "user_recipe_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    recipe_id = Column(Integer, ForeignKey('recipes.id'), nullable=False)
    rating = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_rating'),)
