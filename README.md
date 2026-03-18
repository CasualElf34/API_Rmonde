# World Recipes API & Frontend

Une API **FastAPI** complète + **Frontend React** pour gérer les recettes du monde entier! 🌍

## 🌟 Features

✅ **API Backend:**
- Authentification JWT (login/register)
- CRUD complet pour les recettes
- Recherche & filtrage avancé
- Notation des recettes
- SQLite database

✅ **Frontend Web:**
- Interface moderne et responsive
- Inscription & connexion
- Recherche et filtrage des recettes
- Ajout de nouvelles recettes
- Design intuitif avec gradients

## 📁 Structure

```
├── app/
│   ├── api/              # Endpoints (auth, users, recipes)
│   ├── core/             # Config & security
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   └── main.py           # App FastAPI
├── frontend/
│   └── index.html        # Frontend React (full app)
├── main.py               # Entry point
└── requirements.txt      # Dépendances Python
```

## 🚀 Démarrage Rapide

### 1. **Backend API**

```bash
pip install -r requirements.txt

python main.py
```

L'API sera disponible à: **http://localhost:8000**
- 📖 Docs: http://localhost:8000/docs
- 🏥 Health: http://localhost:8000/health

### 2. **Frontend**

Ouvre simplement le frontend dans ton navigateur:

```bash
cd frontend
python -m http.server 3000
```

Puis accède à: **http://localhost:3000** (si serveur) ou directement le fichier

## 📝 Utilisation

### Création d'un compte
1. Clique sur "S'inscrire"
2. Remplis les infos (email, username, password)
3. Valide

### Connexion
1. Entre tes identifiants
2. Clique "Se connecter"

### Rechercher une recette
1. Utilise la barre de recherche
2. Filtre par cuisine, type, régime
3. Clique sur une recette pour voir les détails

### Ajouter une recette
1. Clique sur "Ajouter" (onglet)
2. Remplis le formulaire
3. Valide

## 📚 API Endpoints

### Auth
- `POST /api/auth/token` - Login

### Users
- `POST /api/users/register` - Register
- `GET /api/users/me` - Mon profil
- `PUT /api/users/me` - Modifier profil
- `DELETE /api/users/me` - Supprimer compte

### Recipes
- `GET /api/recipes` - Liste (avec filtres)
- `GET /api/recipes/search?q=...` - Recherche
- `POST /api/recipes` - Créer
- `GET /api/recipes/{id}` - Détails
- `PUT /api/recipes/{id}` - Modifier
- `DELETE /api/recipes/{id}` - Supprimer
- `POST /api/recipes/{id}/rate` - Noter

## 🛠️ Technos

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Auth
- SQLite

**Frontend:**
- React 18
- Vanilla CSS
- Fetch API
- HTML/CSS/JS

## ✨ Prochaines Étapes

- [ ] Ajouter images aux recettes
- [ ] Système de favoris
- [ ] Partage de recettes
- [ ] Notation détaillée (commentaires)
- [ ] Intégration email
- [ ] Mobile app (React Native)

## 📞 Support

Des questions? Ouvre une issue! 

---

**Version:** 1.0.0
**Status:** ✅ Production-Ready
