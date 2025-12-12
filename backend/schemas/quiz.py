from pydantic import BaseModel
from typing import List

class WordSchema(BaseModel):
    id: int
    tr: str
    en: str

class QuizStartResponse(BaseModel):
    user_id: int
    clerk_id: str
    questions: List[WordSchema]

class AnswerRequest(BaseModel):
    word_id: int
    answer: str

class AnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    user_score: int
    message: str

class LeaderboardUser(BaseModel):
    username: str | None
    total_score: int
    level: str

