from fastapi import FastAPI
from app.api.summarize_routes import router as summarize_router
from app.api.insight_routes import router as insight_router
from app.api.paper_chat_routes import router as paper_chat_router
from app.api.plagiarism_routes import router as plagiarism_router
from app.api.recommendation_routes import router as recommendation_router
app = FastAPI(
    title="Research Intelligence AI Engine",
    description="AI services for research workflow platform",
    version="1.0.0"
)

app.include_router(summarize_router, prefix="/ai")
app.include_router(insight_router, prefix="/ai")
app.include_router(paper_chat_router, prefix="/ai")
app.include_router(plagiarism_router, prefix="/ai")
app.include_router(recommendation_router, prefix="/ai")
@app.get("/")
def health_check():
    return {"status": "AI engine running"}