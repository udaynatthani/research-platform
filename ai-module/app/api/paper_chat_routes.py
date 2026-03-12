from fastapi import APIRouter
from pydantic import BaseModel

from app.services.paper_chat_service import PaperChatService


router = APIRouter()

chat_service = PaperChatService()


class PaperIndexRequest(BaseModel):
    text: str


class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str


@router.post("/index-paper")
def index_paper(request: PaperIndexRequest):
    """
    Index a research paper so it can be queried later.
    """

    chat_service.index_paper(request.text)

    return {"message": "Paper indexed successfully"}


@router.post("/chat-with-paper", response_model=AnswerResponse)
def chat_with_paper(request: QuestionRequest):
    """
    Ask questions about the indexed paper.
    """

    answer = chat_service.answer_question(request.question)

    return {"answer": answer}