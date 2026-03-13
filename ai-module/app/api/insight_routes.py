from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.insight_service import InsightExtractor


router = APIRouter()
extractor = InsightExtractor()


class InsightRequest(BaseModel):
    text: str


class InsightResponse(BaseModel):
    insights: str
    confidence_score: float



@router.post("/extract-insights", response_model=InsightResponse)
async def extract_insights(request: InsightRequest):
    """
    Extract structured research insights from paper text.
    """
    if not request.text or len(request.text) < 100:
        raise HTTPException(status_code=400, detail="Text too short for insight extraction")

    try:
        result = extractor.extract_insights(request.text)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight extraction failed: {str(e)}")