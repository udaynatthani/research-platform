from fastapi import APIRouter
from pydantic import BaseModel

from app.services.plagiarism_service import PlagiarismService


router = APIRouter()

service = PlagiarismService()


class PlagiarismRequest(BaseModel):
    paper: str


@router.post("/check-plagiarism")
def check_plagiarism(request: PlagiarismRequest):

    return service.check_plagiarism(request.paper)