from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from app.models.database import Base, engine, SessionLocal
from app.models.recipe import Recipe
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.recipes import router as recipes_router
from app.api.favorites import router as favorites_router

Base.metadata.create_all(bind=engine)


SEED_RECIPES = [
    {"name": "Coq au Vin", "description": "Plat traditionnel français avec poulet mijoté au vin rouge", "ingredients": "Poulet, vin rouge, champignons, oignons, lardons, herbes de Provence", "instructions": "1. Faire dorer le poulet\n2. Ajouter le vin\n3. Mijoter 1h30", "cuisine": "Française", "dish_type": "Plat", "dietary_type": "Normal", "prep_time": 20, "cook_time": 90, "servings": 4, "difficulty": "Moyen", "rating": 4.5, "is_published": True},
    {"name": "Pâtes Carbonara", "description": "Pâtes italiennes authentiques avec œufs, lardons et pecorino", "ingredients": "Pâtes, œufs, lardons, pecorino, poivre noir", "instructions": "1. Cuire les pâtes\n2. Mélanger œufs et fromage\n3. Incorporer hors du feu", "cuisine": "Italienne", "dish_type": "Plat", "dietary_type": "Normal", "prep_time": 15, "cook_time": 20, "servings": 4, "difficulty": "Facile", "rating": 4.8, "is_published": True},
    {"name": "Sushi Rolls", "description": "Rouleaux de sushi avec saumon frais et riz vinaigré", "ingredients": "Riz sushi, nori, saumon, concombre, avocat, sauce soja", "instructions": "1. Préparer le riz\n2. Napper le nori de riz\n3. Ajouter les garnitures\n4. Rouler et couper", "cuisine": "Asiatique", "dish_type": "Plat", "dietary_type": "Normal", "prep_time": 30, "cook_time": 10, "servings": 2, "difficulty": "Moyen", "rating": 4.6, "is_published": True},
    {"name": "Tacos al Pastor", "description": "Tacos mexicains avec viande marinée à l'ananas", "ingredients": "Longe de porc, ananas, oignon, coriandre, tortillas, sauce piquante", "instructions": "1. Mariner la viande\n2. Faire cuire\n3. Assembler dans les tortillas", "cuisine": "Mexicaine", "dish_type": "Plat", "dietary_type": "Normal", "prep_time": 20, "cook_time": 30, "servings": 4, "difficulty": "Facile", "rating": 4.7, "is_published": True},
    {"name": "Buddha Bowl Végétarien", "description": "Bol nutritif avec légumes frais, quinoa et sauce tahini", "ingredients": "Quinoa, pois chiches, kale, carottes, betteraves, sauce tahini", "instructions": "1. Cuire le quinoa\n2. Rôtir les légumes\n3. Assembler le bol\n4. Napper de sauce tahini", "cuisine": "Moderne", "dish_type": "Plat", "dietary_type": "Végétarien", "prep_time": 25, "cook_time": 35, "servings": 2, "difficulty": "Facile", "rating": 4.4, "is_published": True},
    {"name": "Soupe à l'Oignon Gratinée", "description": "Soupe française classique avec oignons caramélisés et gruyère", "ingredients": "Oignons, bouillon de bœuf, vin blanc, baguette, gruyère", "instructions": "1. Caraméliser les oignons\n2. Ajouter le bouillon\n3. Mijoter 30 min\n4. Gratiner au four", "cuisine": "Française", "dish_type": "Entrée", "dietary_type": "Normal", "prep_time": 15, "cook_time": 45, "servings": 4, "difficulty": "Facile", "rating": 4.5, "is_published": True},
    {"name": "Tiramisu", "description": "Dessert italien au mascarpone, café et cacao", "ingredients": "Biscuits ladyfingers, mascarpone, œufs, sucre, café, cacao en poudre", "instructions": "1. Tremper les biscuits dans le café\n2. Préparer la crème au mascarpone\n3. Alterner couches\n4. Réfrigérer 4h", "cuisine": "Italienne", "dish_type": "Dessert", "dietary_type": "Normal", "prep_time": 20, "cook_time": 0, "servings": 6, "difficulty": "Moyen", "rating": 4.9, "is_published": True},
    {"name": "Pad Thai", "description": "Nouilles sautées thaïes aux crevettes et cacahuètes", "ingredients": "Nouilles de riz, crevettes, œuf, germes de soja, cacahuètes, sauce tamarind", "instructions": "1. Tremper les nouilles\n2. Faire revenir les crevettes\n3. Ajouter nouilles et sauce\n4. Garnir de cacahuètes", "cuisine": "Asiatique", "dish_type": "Plat", "dietary_type": "Normal", "prep_time": 20, "cook_time": 15, "servings": 3, "difficulty": "Moyen", "rating": 4.6, "is_published": True},
    {"name": "Gaspacho Andalou", "description": "Soupe froide espagnole aux tomates fraîches et légumes", "ingredients": "Tomates, concombre, poivron rouge, oignon, ail, huile d'olive, vinaigre", "instructions": "1. Mixer les légumes\n2. Assaisonner\n3. Réfrigérer 2h\n4. Servir bien frais", "cuisine": "Espagnole", "dish_type": "Entrée", "dietary_type": "Végétalien", "prep_time": 15, "cook_time": 0, "servings": 4, "difficulty": "Facile", "rating": 4.3, "is_published": True},
    {"name": "Curry de Lentilles", "description": "Dal indien réconfortant aux épices parfumées", "ingredients": "Lentilles rouges, lait de coco, tomates, oignon, ail, gingembre, curry, cumin", "instructions": "1. Faire revenir oignon et épices\n2. Ajouter lentilles et tomates\n3. Verser le lait de coco\n4. Cuire 25 min", "cuisine": "Indienne", "dish_type": "Plat", "dietary_type": "Végétalien", "prep_time": 10, "cook_time": 30, "servings": 4, "difficulty": "Facile", "rating": 4.6, "is_published": True},
]


def seed_database():
    """Insère les recettes de démonstration si la base est vide."""
    db = SessionLocal()
    try:
        count = db.query(Recipe).count()
        if count == 0:
            for data in SEED_RECIPES:
                db.add(Recipe(**data))
            db.commit()
            print(f"✅ {len(SEED_RECIPES)} recettes de démonstration insérées.")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Seed échoué : {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield


app = FastAPI(
    title="World Recipes API",
    description="API pour gérer et fournir des recettes du monde",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=500)


@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path.lower()

    if path.endswith((".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".ico")):
        response.headers["Cache-Control"] = "public, max-age=300"
    elif path.endswith(".html") or path == "/":
        response.headers["Cache-Control"] = "public, max-age=300"

    return response

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(recipes_router)
app.include_router(favorites_router)

frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
