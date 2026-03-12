from fastapi import APIRouter
from pydantic import BaseModel

from app.services.summarizer_service import PaperSummarizer


router = APIRouter()

summarizer = PaperSummarizer()


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    summary: str


@router.post("/summarize-paper", response_model=SummarizeResponse)
def summarize_paper(request: SummarizeRequest):
    """
    Generate a summary for a research paper.
    """

    summary = summarizer.summarize_paper(request.text)

    return {"summary": summary}