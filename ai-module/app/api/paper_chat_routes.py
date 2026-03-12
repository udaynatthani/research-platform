from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.paper_chat_service import paper_chat_service

router = APIRouter()


class PaperIndexRequest(BaseModel):
    paper_id: str
    text: str


class QuestionRequest(BaseModel):
    question: str
    paper_id: Optional[str] = None


class AnswerResponse(BaseModel):
    answer: str


@router.post("/index-paper")
async def index_paper(request: PaperIndexRequest):
    """
    Index a paper for RAG, scoped to paper_id.
    """
    if not request.paper_id or not request.text:
        raise HTTPException(status_code=400, detail="paper_id and text are required")

    try:
        paper_chat_service.index_paper(request.paper_id, request.text)
        return {"message": f"Paper {request.paper_id} indexed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@router.post("/chat-with-paper", response_model=AnswerResponse)
async def chat_with_paper(request: QuestionRequest):
    """
    Ask a question about indexed paper(s). Optional paper_id filter.
    """
    if not request.question:
        raise HTTPException(status_code=400, detail="question is required")

    try:
        answer = paper_chat_service.answer_question(request.question, request.paper_id)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")