from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.database import db
from app.routes import ai_routes
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect_db()
    yield
    # Shutdown
    await db.close_db()

app = FastAPI(
    title=os.getenv("API_TITLE", "CivicEye AI Services"),
    version=os.getenv("API_VERSION", "1.0.0"),
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ai_routes.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
async def root():
    return {
        "service": "CivicEye AI Services",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
