from fastapi import APIRouter
from pydantic import BaseModel

from app.services.paper_chat_service import paper_chat_service

router = APIRouter()


class PaperIndexRequest(BaseModel):
    text: str


class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str


@router.post("/index-paper")
def index_paper(request: PaperIndexRequest):

    paper_chat_service.index_paper(request.text)

    return {"message": "Paper indexed successfully"}


@router.post("/chat-with-paper", response_model=AnswerResponse)
def chat_with_paper(request: QuestionRequest):

    answer = paper_chat_service.answer_question(request.question)

    return {"answer": answer}