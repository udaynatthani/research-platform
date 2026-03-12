from fastapi import APIRouter
from pydantic import BaseModel

from app.services.insight_service import InsightExtractor


router = APIRouter()

extractor = InsightExtractor()


class InsightRequest(BaseModel):
    text: str


class InsightResponse(BaseModel):
    insights: str


@router.post("/extract-insights", response_model=InsightResponse)
def extract_insights(request: InsightRequest):
    """
    Extract structured research insights from paper text.
    """

    insights = extractor.extract_insights(request.text)

    return {"insights": insights}