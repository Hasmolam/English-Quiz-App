from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from sqlalchemy.sql.expression import func
import random

# Diğer dosyalarımızdan import ediyoruz
from database import get_session
from models import Word, User
from auth import get_current_db_user
from schemas.quiz import QuizStartResponse, AnswerRequest, AnswerResponse, LeaderboardUser, QuestionSchema
from typing import List

# Router oluşturuyoruz
router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.get("/leaderboard", response_model=List[LeaderboardUser])
def get_leaderboard(session: Session = Depends(get_session)):
    # En yüksek puanlı 10 kullanıcıyı getir
    statement = select(User).order_by(desc(User.total_score)).limit(10)
    users = session.exec(statement).all()
    return users

@router.get("/start", response_model=QuizStartResponse)
def start_quiz(
    user: User = Depends(get_current_db_user), # Auth ve DB User buradan gelir
    session: Session = Depends(get_session) # DB buradan gelir
):
    print(f"User DB ID: {user.id}, Clerk ID: {user.clerk_id}")

    # 1. Sorulacak 5 kelimeyi çek
    statement = select(Word).order_by(func.random()).limit(5)
    questions_words = session.exec(statement).all()
    
    quiz_questions = []
    
    for word in questions_words:
        if word.id is None:
            continue

        # 2. Her kelime için 3 tane yanlış cevap (distractor) çek
        # Kendisi hariç rastgele 3 kelime
        distractor_statement = select(Word).where(Word.id != word.id).order_by(func.random()).limit(3)
        distractors = session.exec(distractor_statement).all()
        
        # 3. Şıkları oluştur (Doğru cevap + 3 yanlış)
        options = [w.en for w in distractors]
        options.append(word.en)
        
        # 4. Şıkları karıştır
        random.shuffle(options)
        
        # 5. Soru objesini oluştur
        q = QuestionSchema(
            id=word.id,
            question=word.tr, # Sorulan kelime (Türkçe)
            options=options   # Şıklar (İngilizce)
        )
        quiz_questions.append(q)
    
    if user.id is None:
        raise HTTPException(status_code=500, detail="User ID missing")

    return {
        "user_id": user.id,
        "clerk_id": user.clerk_id,
        "questions": quiz_questions
    }


@router.post("/answer", response_model=AnswerResponse)
def submit_answer(
    answer_data: AnswerRequest,
    user: User = Depends(get_current_db_user),
    session: Session = Depends(get_session)
):
    # Kelimeyi bul
    word = session.get(Word, answer_data.word_id)
    if not word:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı")
    
    # Cevabı kontrol et (Case insensitive)
    # Sadece İngilizce karşılığı doğru kabul ediyoruz.
    user_answer = answer_data.answer.strip().lower()
    correct_en = word.en.strip().lower()
    
    is_correct = (user_answer == correct_en)
    
    if is_correct:
        # Puan ekle (Örnek: Her doğru cevap 10 puan)
        user.total_score += 10
        session.add(user)
        session.commit()
        session.refresh(user)
        message = "Tebrikler! Doğru cevap."
    else:
        message = f"Yanlış cevap. Doğrusu: {word.en}"

    return {
        "correct": is_correct,
        "correct_answer": word.en, # Doğru cevabı İngilizce olarak dönüyoruz standart olarak
        "user_score": user.total_score,
        "message": message
    }
