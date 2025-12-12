from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
import os
from dotenv import load_dotenv
from sqlmodel import Session, select
from database import get_session
from models import User

load_dotenv()
# Clerk Ayarları
CLERK_ISSUER_URL = os.getenv("CLERK_ISSUER_URL")
JWKS_URL = f"{CLERK_ISSUER_URL}/.well-known/jwks.json"

security = HTTPBearer()
jwk_client = PyJWKClient(JWKS_URL)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER_URL,
            options={"verify_signature": True}
        )
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş token."
        )

def get_current_db_user(
    payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> User:
    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token içerisinde kullanıcı ID (sub) bulunamadı."
        )
    
    statement = select(User).where(User.clerk_id == clerk_id)
    user = session.exec(statement).first()
    
    if not user:
        # Kullanıcı veritabanında yoksa oluştur
        # Not: Email bilgisi token'da olmayabilir, Clerk ayarlarından JWT şablonuna eklenmeli
        email = payload.get("email") 
        username = payload.get("username") # Varsa
        
        user = User(
            clerk_id=clerk_id,
            email=email,
            username=username,
            total_score=0,
            level="A1"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
    return user