from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.session import engine
from app.routers import admin, auth, events, meta
from app.services.bootstrap import initialize_database

settings = get_settings()
app = FastAPI(title="kalendernetz backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    initialize_database(engine)


@app.get("/health")
@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


for router in (auth.router, meta.router, events.router, admin.router):
    app.include_router(router)
    app.include_router(router, prefix="/api")
