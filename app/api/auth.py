from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin, Token
from app.core.security import (
    verify_password,
    create_access_token,
)
from app.core.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authentifier un utilisateur et retourner un token JWT
    """
    user = db.query(User).filter(User.username == user_credentials.username).first()
    
    # Vérification: l'utilisateur doit exister et avoir un mot de passe (pas un compte uniquement Google)
    if not user or not user.hashed_password or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/config")
async def get_auth_config():
    """
    Retourne la configuration publique pour l'authentification
    """
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID
    }


@router.post("/google", response_model=Token)
async def google_auth(payload: dict, db: Session = Depends(get_db)):
    """
    Vérifie le token Google et connecte ou crée l'utilisateur
    """
    credential = payload.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Credential manquant")

    try:
        # Vérification du token avec Google
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        # Extraction des infos
        email = idinfo['email']
        name = idinfo.get('name', '')
        google_id = idinfo['sub']

        # Chercher l'utilisateur par email
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Créer l'utilisateur s'il n'existe pas
            # On utilise le google_id comme pseudo par défaut si besoin
            username = email.split('@')[0]
            # Vérifier si cet username est déjà pris
            existing_user = db.query(User).filter(User.username == username).first()
            if existing_user:
                username = f"{username}_{google_id[:5]}"

            user = User(
                email=email,
                username=username,
                full_name=name,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Compte désactivé")

        # Générer le token JWT de notre application
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        # Token invalide
        raise HTTPException(status_code=401, detail="Token Google invalide")
