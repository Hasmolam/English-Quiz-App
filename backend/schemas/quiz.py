from pydantic import BaseModel
from typing import List, Optional

class QuestionSchema(BaseModel):
    id: int
    question: str
    options: List[str]

class QuizStartResponse(BaseModel):
    user_id: int
    questions: List[QuestionSchema]

class AnswerRequest(BaseModel):
    word_id: int
    answer: str

class AnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    user_score: int
    user_level: str
    message: str

class LeaderboardUser(BaseModel):
    id: int
    username: str | None
    total_score: int
    level: str

class DailyActivityItem(BaseModel):
    day_name: str
    date: str
    is_completed: bool
    is_today: bool

class AchievementItem(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    current_value: int
    target_value: int
    is_unlocked: bool
    color: str

class UserStatsResponse(BaseModel):
    total_score: int
    level: str
    rank: int
    total_players: int
    quizzes_completed: int
    correct_answers: int
    total_answers: int
    accuracy_rate: int
    current_streak: int
    longest_streak: int
    weekly_activity: List[DailyActivityItem]
    achievements: List[AchievementItem]
