from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.summarizer_service import PaperSummarizer
from app.services.topic_service import topic_service


router = APIRouter()
summarizer = PaperSummarizer()


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    summary: str
    key_contributions: str
    methodology: str
    limitations: str
    topics: List[str]


@router.post("/summarize-paper", response_model=SummarizeResponse)
async def summarize_paper(request: SummarizeRequest):
    """
    Generate a structured research summary and extract topics.
    """
    if not request.text or len(request.text) < 100:
        raise HTTPException(status_code=400, detail="Text too short for summarization")

    try:
        # Get structured summary (summary, findings, methodology, etc)
        result = summarizer.summarize_paper(request.text)
        
        # Get topics/keywords
        topics = topic_service.extract_topics(request.text)
        
        return {
            "summary": result["summary"],
            "key_contributions": result["key_contributions"],
            "methodology": result["methodology"],
            "limitations": result["limitations"],
            "topics": topics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")