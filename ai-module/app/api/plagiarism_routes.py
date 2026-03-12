from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List


from app.services.plagiarism_service import PlagiarismService


router = APIRouter()
plagiarism_checker = PlagiarismService()


class PlagiarismRequest(BaseModel):
    text: str


class MatchingSection(BaseModel):
    text: str
    matched_text: str
    similarity: float


class PlagiarismResponse(BaseModel):
    plagiarism_score: float
    matching_sections: List[MatchingSection]


@router.post("/check-plagiarism", response_model=PlagiarismResponse)
async def check_plagiarism(request: PlagiarismRequest):
    """
    Check paper text for plagiarism against indexed papers.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required for plagiarism check")

    try:
        results = plagiarism_checker.check_plagiarism(request.text)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plagiarism check failed: {str(e)}")