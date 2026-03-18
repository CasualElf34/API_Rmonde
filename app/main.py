from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.models.database import Base, engine
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.recipes import router as recipes_router
from app.api.favorites import router as favorites_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="World Recipes API",
    description="API pour gérer et fournir des recettes du monde",
    version="1.0.0",
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
