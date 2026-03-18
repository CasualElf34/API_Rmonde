from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.recipe import Recipe
from app.models.rating import UserRecipeRating
from app.models.user import User
from app.models.favorite import favorite
from app.schemas.recipe import Recipe as RecipeSchema
from app.core.security import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])

@router.post("/favorites/{recipe_id}")
async def add_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recette non trouvée")
    
    already_favorited = db.execute(
        favorite.select().where(
            (favorite.c.user_id == current_user.id) &
            (favorite.c.recipe_id == recipe_id)
        )
    ).first()
    
    if already_favorited:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Déjà en favoris")
    
    stmt = favorite.insert().values(user_id=current_user.id, recipe_id=recipe_id)
    db.execute(stmt)
    db.commit()
    return {"message": "Ajouté aux favoris"}

@router.delete("/favorites/{recipe_id}")
async def remove_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = favorite.delete().where(
        (favorite.c.user_id == current_user.id) &
        (favorite.c.recipe_id == recipe_id)
    )
    db.execute(stmt)
    db.commit()
    return {"message": "Retiré des favoris"}

@router.get("/favorites", response_model=List[RecipeSchema])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recipe_ids = db.execute(
        favorite.select().where(favorite.c.user_id == current_user.id)
    ).fetchall()
    
    recipes = db.query(Recipe).filter(Recipe.id.in_([r[1] for r in recipe_ids])).all()
    return recipes

@router.post("/rate/{recipe_id}")
async def rate_recipe(
    recipe_id: int,
    rating: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if rating < 0 or rating > 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La note doit être entre 0 et 5")
    
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recette non trouvée")
    
    existing_rating = db.query(UserRecipeRating).filter(
        (UserRecipeRating.user_id == current_user.id) &
        (UserRecipeRating.recipe_id == recipe_id)
    ).first()
    
    if existing_rating:
        existing_rating.rating = rating
    else:
        new_rating = UserRecipeRating(user_id=current_user.id, recipe_id=recipe_id, rating=rating)
        db.add(new_rating)
    
    db.commit()
    return {"message": "Note enregistrée", "rating": rating}

@router.get("/isFavorite/{recipe_id}")
async def is_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorite_record = db.execute(
        favorite.select().where(
            (favorite.c.user_id == current_user.id) &
            (favorite.c.recipe_id == recipe_id)
        )
    ).first()
    return {"isFavorite": favorite_record is not None}
