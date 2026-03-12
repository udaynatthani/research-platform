from fastapi import APIRouter
from pydantic import BaseModel

from app.services.recommendation_service import RecommendationService


router = APIRouter()

service = RecommendationService()


class RecommendationRequest(BaseModel):
    paper: str


@router.post("/recommend-papers")
def recommend_papers(request: RecommendationRequest):

    return service.recommend_papers(request.paper)