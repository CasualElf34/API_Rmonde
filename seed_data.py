from app.models.database import SessionLocal
from app.models.recipe import Recipe
from datetime import datetime, timezone

db = SessionLocal()

recipes = [
    {
        "name": "Coq au Vin",
        "description": "Plat traditionnel français avec poulet mijoté au vin rouge",
        "ingredients": "Poulet, vin rouge, champignons, oignons, lardons, herbes de Provence",
        "instructions": "1. Faire dorer le poulet\n2. Ajouter le vin\n3. Mijoter 1h30",
        "cuisine": "Française",
        "dish_type": "Plat",
        "dietary_type": "Normal",
        "prep_time": 20,
        "cook_time": 90,
        "servings": 4,
        "difficulty": "Moyen",
        "rating": 4.5,
        "is_published": True,
    },
    {
        "name": "Pâtes Carbonara",
        "description": "Plat français authentique avec œufs, lardons et fromage",
        "ingredients": "Pâtes, œufs, lardons, pecorino, poivre noir",
        "instructions": "1. Cuire les pâtes\n2. Mélanger œufs et fromage\n3. Mélanger avec pâtes chaudes",
        "cuisine": "Italienne",
        "dish_type": "Plat",
        "dietary_type": "Normal",
        "prep_time": 15,
        "cook_time": 20,
        "servings": 4,
        "difficulty": "Facile",
        "rating": 4.8,
        "is_published": True,
    },
    {
        "name": "Sushi Rolls",
        "description": "Rouleaux de sushi avec saumon frais et riz",
        "ingredients": "Riz sushi, nori, saumon, concombre, avocat, sauce soja",
        "instructions": "1. Préparer le riz\n2. Napper de riz\n3. Ajouter les garnitures\n4. Rouler et couper",
        "cuisine": "Asiatique",
        "dish_type": "Plat",
        "dietary_type": "Normal",
        "prep_time": 30,
        "cook_time": 10,
        "servings": 2,
        "difficulty": "Moyen",
        "rating": 4.6,
        "is_published": True,
    },
    {
        "name": "Tacos al Pastor",
        "description": "Tacos délicieux avec viande marinée et ananas",
        "ingredients": "Longe de porc, ananas, oignon, coriandre, tortillas, sauce piquante",
        "instructions": "1. Mariner la viande\n2. Faire cuire\n3. Assembler dans tortillas",
        "cuisine": "Mexicaine",
        "dish_type": "Plat",
        "dietary_type": "Normal",
        "prep_time": 20,
        "cook_time": 30,
        "servings": 4,
        "difficulty": "Facile",
        "rating": 4.7,
        "is_published": True,
    },
    {
        "name": "Buddha Bowl Végétarien",
        "description": "Bol nutritif avec légumes frais et grains",
        "ingredients": "Quinoa, pois chiches, chou kale, carottes, betteraves, sauce tahini",
        "instructions": "1. Cuire quinoa\n2. Rôtir les légumes\n3. Assembler le bol\n4. Ajouter la sauce",
        "cuisine": "Moderne",
        "dish_type": "Plat",
        "dietary_type": "Végétarien",
        "prep_time": 25,
        "cook_time": 35,
        "servings": 2,
        "difficulty": "Facile",
        "rating": 4.4,
        "is_published": True,
    },
    {
        "name": "Soupe à l'Oignon Gratinée",
        "description": "Soupe française classique avec oignons et pain grillé",
        "ingredients": "Oignons, bouillon de bœuf, vin blanc, pain baguette, gruyère",
        "instructions": "1. Cuire les oignons\n2. Ajouter le bouillon\n3. Mijoter 30 min\n4. Gratiner au four",
        "cuisine": "Française",
        "dish_type": "Entrée",
        "dietary_type": "Normal",
        "prep_time": 15,
        "cook_time": 45,
        "servings": 4,
        "difficulty": "Facile",
        "rating": 4.5,
        "is_published": True,
    },
    {
        "name": "Tiramisu",
        "description": "Dessert italien délicieux avec mascarpone et cacao",
        "ingredients": "Biscuits ladyfingers, mascarpone, œufs, sucre, café, cacao",
        "instructions": "1. Tremper biscuits dans café\n2. Faire la crème\n3. Assembler en couches\n4. Réfrigérer 4h",
        "cuisine": "Italienne",
        "dish_type": "Dessert",
        "dietary_type": "Normal",
        "prep_time": 20,
        "cook_time": 0,
        "servings": 6,
        "difficulty": "Moyen",
        "rating": 4.9,
        "is_published": True,
    },
    {
        "name": "Pad Thai",
        "description": "Nouilles sautées thaïes avec légumes et protéines",
        "ingredients": "Nouilles de riz, crevettes, œuf, germes de soja, cacahuètes, sauce tamarind",
        "instructions": "1. Cuire les nouilles\n2. Faire revenir crevettes\n3. Ajouter nouilles et légumes\n4. Ajouter sauce",
        "cuisine": "Asiatique",
        "dish_type": "Plat",
        "dietary_type": "Normal",
        "prep_time": 20,
        "cook_time": 15,
        "servings": 3,
        "difficulty": "Moyen",
        "rating": 4.6,
        "is_published": True,
    },
]

try:
    for recipe_data in recipes:
        recipe = Recipe(**recipe_data)
        db.add(recipe)
    
    db.commit()
    print(f"✅ {len(recipes)} recettes ajoutées avec succès !")
except Exception as e:
    db.rollback()
    print(f"❌ Erreur : {e}")
finally:
    db.close()
