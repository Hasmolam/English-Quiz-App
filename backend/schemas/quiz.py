from pydantic import BaseModel
from typing import List

class QuestionSchema(BaseModel):
    id: int
    question: str
    options: List[str]

class QuizStartResponse(BaseModel):
    user_id: int
    clerk_id: str
    questions: List[QuestionSchema]

class AnswerRequest(BaseModel):
    word_id: int
    answer: str

class AnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    user_score: int
    message: str

class LeaderboardUser(BaseModel):
    id: int
    username: str | None
    total_score: int
    level: str

class UserStatsResponse(BaseModel):
    total_score: int
    level: str
    rank: int
    total_players: int

