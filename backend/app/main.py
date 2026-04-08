from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analysis, data, visualizations

app = FastAPI(
    title="StatLab API",
    description="Retro data analysis and visualization engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(visualizations.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
