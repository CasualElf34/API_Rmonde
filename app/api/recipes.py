from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.recipe import Recipe
from app.models.user import User
from app.schemas.recipe import Recipe as RecipeSchema, RecipeCreate, RecipeUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.post("/", response_model=RecipeSchema)
async def create_recipe(
    recipe: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle recette
    """
    db_recipe = Recipe(**recipe.dict())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.get("/", response_model=List[RecipeSchema])
async def list_recipes(
    name: str = Query(None),
    cuisine: str = Query(None),
    dish_type: str = Query(None),
    dietary_type: str = Query(None),
    ingredients: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des recettes avec filtrage optionnel
    """
    query = db.query(Recipe).filter(Recipe.is_published == True)
    
    if name:
        query = query.filter(Recipe.name.ilike(f"%{name}%"))
    
    if cuisine:
        query = query.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))
    
    if dish_type:
        query = query.filter(Recipe.dish_type.ilike(f"%{dish_type}%"))
    
    if dietary_type:
        query = query.filter(Recipe.dietary_type.ilike(f"%{dietary_type}%"))
    
    if ingredients:
        query = query.filter(Recipe.ingredients.ilike(f"%{ingredients}%"))
    
    recipes = query.offset(skip).limit(limit).all()
    return recipes


@router.get("/search", response_model=List[RecipeSchema])
async def search_recipes(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Rechercher les recettes par nom, ingrédient ou description
    """
    search_term = f"%{q}%"
    recipes = db.query(Recipe).filter(
        (Recipe.name.ilike(search_term) |
         Recipe.description.ilike(search_term) |
         Recipe.ingredients.ilike(search_term) |
         Recipe.cuisine.ilike(search_term)) &
        (Recipe.is_published == True)
    ).offset(skip).limit(limit).all()
    
    return recipes


@router.get("/{recipe_id}", response_model=RecipeSchema)
async def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Récupérer les détails d'une recette par son ID
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recette non trouvée"
        )
    return recipe


@router.put("/{recipe_id}", response_model=RecipeSchema)
async def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une recette existante
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recette non trouvée"
        )

    if recipe.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres recettes"
        )

    update_data = recipe_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recipe, field, value)

    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer une recette
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recette non trouvée"
        )

    if recipe.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que vos propres recettes"
        )

    db.delete(recipe)
    db.commit()
    return None


@router.post("/{recipe_id}/rate")
async def rate_recipe(
    recipe_id: int,
    rating: float = Query(..., ge=0, le=5),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Noter une recette (0-5 étoiles)
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recette non trouvée"
        )
    
    recipe.rating = rating
    db.commit()
    db.refresh(recipe)
    return recipe
