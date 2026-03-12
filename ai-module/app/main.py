from fastapi import FastAPI
from app.api.summarize_routes import router as summarize_router

app = FastAPI(
    title="Research Intelligence AI Engine",
    description="AI services for research workflow platform",
    version="1.0.0"
)

app.include_router(summarize_router, prefix="/ai")


@app.get("/")
def health_check():
    return {"status": "AI engine running"}