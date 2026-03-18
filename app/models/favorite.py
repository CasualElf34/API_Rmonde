from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, Table
from datetime import datetime, timezone
from app.models.database import Base

favorite = Table(
    'favorites',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('recipe_id', Integer, ForeignKey('recipes.id'), primary_key=True),
    Column('created_at', DateTime, default=lambda: datetime.now(timezone.utc)),
    UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe')
)
