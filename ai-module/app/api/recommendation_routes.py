from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.services.recommendation_service import RecommendationService


router = APIRouter()
recommender = RecommendationService()


class RecommendationRequest(BaseModel):
    text: str
    top_k: int = 5


class Recommendation(BaseModel):
    paper_id: str
    title: str
    text_preview: str
    similarity_score: float


class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]


@router.post("/recommend-papers", response_model=RecommendationResponse)
async def recommend_papers(request: RecommendationRequest):
    """
    Recommend similar papers based on semantic text similarity.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required for recommendations")

    try:
        results = recommender.recommend_papers(request.text, top_k=request.top_k)
        return {"recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")