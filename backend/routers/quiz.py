from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from sqlalchemy.sql.expression import func
from datetime import date, timedelta
import random
from typing import List

from database import get_session
from models import Word, User, DailyStats
from auth import get_current_db_user
from schemas.quiz import (
    QuizStartResponse,
    AnswerRequest,
    AnswerResponse,
    LeaderboardUser,
    QuestionSchema,
    UserStatsResponse,
    DailyActivityItem,
    AchievementItem,
)

router = APIRouter(prefix="/quiz", tags=["Quiz"])

def calculate_level(score: int) -> str:
    """Calculates English CEFR level based on total XP score."""
    if score >= 1000:
        return "C1"
    elif score >= 600:
        return "B2"
    elif score >= 300:
        return "B1"
    elif score >= 100:
        return "A2"
    return "A1"


@router.get("/leaderboard", response_model=List[LeaderboardUser])
def get_leaderboard(session: Session = Depends(get_session)):
    statement = select(User).order_by(desc(User.total_score)).limit(10)
    users = session.exec(statement).all()
    return users


@router.get("/start", response_model=QuizStartResponse)
def start_quiz(
    user: User = Depends(get_current_db_user),
    session: Session = Depends(get_session),
):
    if user.id is None:
        raise HTTPException(status_code=500, detail="User ID missing")

    statement = select(Word).order_by(func.random()).limit(5)
    questions_words = session.exec(statement).all()

    quiz_questions = []
    for word in questions_words:
        if word.id is None:
            continue

        distractor_statement = select(Word).where(Word.id != word.id).order_by(func.random()).limit(3)
        distractors = session.exec(distractor_statement).all()

        options = [w.en for w in distractors]
        options.append(word.en)
        random.shuffle(options)

        q = QuestionSchema(
            id=word.id,
            question=word.tr,
            options=options,
        )
        quiz_questions.append(q)

    return {
        "user_id": user.id,
        "questions": quiz_questions,
    }


@router.post("/answer", response_model=AnswerResponse)
def submit_answer(
    answer_data: AnswerRequest,
    user: User = Depends(get_current_db_user),
    session: Session = Depends(get_session),
):
    word = session.get(Word, answer_data.word_id)
    if not word:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")

    user_answer = answer_data.answer.strip().lower()
    correct_en = word.en.strip().lower()
    is_correct = (user_answer == correct_en)

    user.total_answers = (user.total_answers or 0) + 1

    if is_correct:
        user.correct_answers = (user.correct_answers or 0) + 1
        user.total_score += 10
        message = "Tebrikler! Doğru cevap."
    else:
        message = f"Yanlış cevap. Doğrusu: {word.en}"

    user.level = calculate_level(user.total_score)
    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "correct": is_correct,
        "correct_answer": word.en,
        "user_score": user.total_score,
        "user_level": user.level,
        "message": message,
    }


@router.post("/finish")
def finish_quiz(
    user: User = Depends(get_current_db_user),
    session: Session = Depends(get_session),
):
    today = date.today()
    today_str = str(today)
    yesterday_str = str(today - timedelta(days=1))

    user.quizzes_completed = (user.quizzes_completed or 0) + 1

    # Real streak tracking
    if user.last_active_date:
        if user.last_active_date == today_str:
            pass  # Already active today, maintain current streak
        elif user.last_active_date == yesterday_str:
            user.current_streak = (user.current_streak or 0) + 1
        else:
            user.current_streak = 1  # Streak was broken, restart
    else:
        user.current_streak = 1

    user.longest_streak = max(user.longest_streak or 0, user.current_streak)
    user.last_active_date = today_str

    # Update DailyStats
    statement = select(DailyStats).where(DailyStats.user_id == user.id, DailyStats.date == today)
    stats = session.exec(statement).first()

    if not stats:
        stats = DailyStats(user_id=user.id, date=today, quizzes_completed=1, daily_score=0)
    else:
        stats.quizzes_completed += 1

    session.add(user)
    session.add(stats)
    session.commit()

    return {
        "message": "Daily stats updated",
        "today_completed": stats.quizzes_completed,
        "current_streak": user.current_streak,
    }


@router.get("/daily_progress")
def get_daily_progress(
    user: User = Depends(get_current_db_user),
    session: Session = Depends(get_session),
):
    today = date.today()
    statement = select(DailyStats).where(DailyStats.user_id == user.id, DailyStats.date == today)
    stats = session.exec(statement).first()

    completed = stats.quizzes_completed if stats else 0
    target = 5

    return {
        "completed": completed,
        "target": target,
    }


@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(
    user: User = Depends(get_current_db_user),
    session: Session = Depends(get_session),
):
    today = date.today()
    today_str = str(today)
    yesterday_str = str(today - timedelta(days=1))

    # Keep level up to date
    user.level = calculate_level(user.total_score)

    # Validate active streak
    if user.last_active_date and user.last_active_date not in (today_str, yesterday_str):
        user.current_streak = 0
        session.add(user)
        session.commit()

    # Calculate Rank & Total Players
    rank_statement = select(func.count()).where(User.total_score > user.total_score)
    rank = session.exec(rank_statement).one() + 1

    total_players_statement = select(func.count()).select_from(User)
    total_players = session.exec(total_players_statement).one()

    # Calculate accuracy
    total_answers = user.total_answers or 0
    correct_answers = user.correct_answers or 0
    accuracy_rate = int(round((correct_answers / total_answers) * 100)) if total_answers > 0 else 0

    # Build weekly activity (current week Monday through Sunday)
    start_of_week = today - timedelta(days=today.weekday())
    day_labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

    # Query daily stats for the current week
    week_end = start_of_week + timedelta(days=6)
    week_stats_stmt = select(DailyStats).where(
        DailyStats.user_id == user.id,
        DailyStats.date >= start_of_week,
        DailyStats.date <= week_end,
    )
    week_records = {rec.date: rec.quizzes_completed for rec in session.exec(week_stats_stmt).all()}

    weekly_activity: List[DailyActivityItem] = []
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        is_today = (day_date == today)
        completed_count = week_records.get(day_date, 0)
        weekly_activity.append(
            DailyActivityItem(
                day_name=day_labels[i],
                date=str(day_date),
                is_completed=completed_count > 0,
                is_today=is_today,
            )
        )

    # Real achievement badges calculated from actual database records
    score = user.total_score
    quizzes = user.quizzes_completed or 0
    effective_streak = max(user.current_streak or 0, user.longest_streak or 0)

    achievements: List[AchievementItem] = [
        AchievementItem(
            id="first_quiz",
            title="İlk Zafer",
            description="İlk İngilizce quizini başarıyla tamamla.",
            icon="sparkles",
            current_value=1 if quizzes >= 1 else 0,
            target_value=1,
            is_unlocked=quizzes >= 1,
            color="#10B981",
        ),
        AchievementItem(
            id="word_hunter",
            title="Kelime Avcısı",
            description="Toplam 50 XP puanı topla.",
            icon="book",
            current_value=min(score, 50),
            target_value=50,
            is_unlocked=score >= 50,
            color="#3B82F6",
        ),
        AchievementItem(
            id="speed_learner",
            title="Hızlı Öğrenen",
            description="Toplam 150 XP kazanarak seviye atla.",
            icon="flash",
            current_value=min(score, 150),
            target_value=150,
            is_unlocked=score >= 150,
            color="#F59E0B",
        ),
        AchievementItem(
            id="streak_master",
            title="Seri Ustası",
            description="3 gün üst üste pratik yap.",
            icon="flame",
            current_value=min(effective_streak, 3),
            target_value=3,
            is_unlocked=effective_streak >= 3,
            color="#EF4444",
        ),
        AchievementItem(
            id="podium_fighter",
            title="Kürsü Savaşçısı",
            description="Liderlik tablosunda ilk 3 arasına gir.",
            icon="trophy",
            current_value=1 if (rank <= 3 and rank > 0) else 0,
            target_value=1,
            is_unlocked=(rank <= 3 and rank > 0),
            color="#8B5CF6",
        ),
        AchievementItem(
            id="quiz_veteran",
            title="Quiz Gazisi",
            description="Toplam 5 quiz bitir.",
            icon="ribbon",
            current_value=min(quizzes, 5),
            target_value=5,
            is_unlocked=quizzes >= 5,
            color="#06B6D4",
        ),
        AchievementItem(
            id="sharpshooter",
            title="Keskin Nişancı",
            description="En az 10 soru cevaplayıp %80+ isabet oranına ulaş.",
            icon="radio-button-on",
            current_value=accuracy_rate if total_answers >= 10 else total_answers,
            target_value=80 if total_answers >= 10 else 10,
            is_unlocked=(total_answers >= 10 and accuracy_rate >= 80),
            color="#14B8A6",
        ),
        AchievementItem(
            id="master_500",
            title="İngilizce Efsanesi",
            description="500 XP toplayarak elit lige yüksel.",
            icon="medal",
            current_value=min(score, 500),
            target_value=500,
            is_unlocked=score >= 500,
            color="#EC4899",
        ),
    ]

    return {
        "total_score": score,
        "level": user.level,
        "rank": rank,
        "total_players": total_players,
        "quizzes_completed": quizzes,
        "correct_answers": correct_answers,
        "total_answers": total_answers,
        "accuracy_rate": accuracy_rate,
        "current_streak": user.current_streak or 0,
        "longest_streak": user.longest_streak or 0,
        "weekly_activity": weekly_activity,
        "achievements": achievements,
    }
