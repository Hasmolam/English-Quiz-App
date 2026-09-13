import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.sql.expression import func
from sqlmodel import Session, select

from auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import get_session
from models import RefreshToken, User
from schemas.auth import (
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserOut,
    UserRegisterRequest,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    req: UserRegisterRequest,
    session: Session = Depends(get_session),
):
    # Check if username or email already exists
    existing_user_statement = select(User).where(
        (func.lower(User.email) == req.email.lower()) | (func.lower(User.username) == req.username.lower())
    )
    existing_user = session.exec(existing_user_statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta veya kullanıcı adı zaten kullanımda.",
        )

    # Hash password with Argon2
    hashed_password = hash_password(req.password)

    user = User(
        email=req.email.lower(),
        username=req.username.strip(),
        hashed_password=hashed_password,
        total_score=0,
        level="A1",
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Issue initial access and refresh tokens
    access_token = create_access_token(user.id, user.username)
    refresh_token, jti, family_id, expires_at = create_refresh_token(user.id)

    refresh_record = RefreshToken(
        user_id=user.id,
        jti=jti,
        family_id=family_id,
        is_revoked=False,
        expires_at=expires_at,
    )
    session.add(refresh_record)
    session.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            total_score=user.total_score,
            level=user.level,
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=TokenResponse)
def login(
    req: UserLoginRequest,
    session: Session = Depends(get_session),
):
    identifier = req.identifier.strip().lower()
    statement = select(User).where(
        (func.lower(User.email) == identifier) | (func.lower(User.username) == identifier)
    )
    user = session.exec(statement).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz e-posta/kullanıcı adı veya şifre.",
        )

    # Issue access and refresh tokens (new session family)
    access_token = create_access_token(user.id, user.username)
    refresh_token, jti, family_id, expires_at = create_refresh_token(user.id)

    refresh_record = RefreshToken(
        user_id=user.id,
        jti=jti,
        family_id=family_id,
        is_revoked=False,
        expires_at=expires_at,
    )
    session.add(refresh_record)
    session.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            total_score=user.total_score,
            level=user.level,
            created_at=user.created_at,
        ),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    req: RefreshTokenRequest,
    session: Session = Depends(get_session),
):
    payload = decode_token(req.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz refresh token tipi.",
        )

    jti = payload.get("jti")
    family_id = payload.get("family_id")
    user_id_str = payload.get("sub")

    if not jti or not family_id or not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Eksik token bilgisi.",
        )

    token_record = session.exec(
        select(RefreshToken).where(RefreshToken.jti == jti)
    ).first()

    # --- REPLAY ATTACK DETECTION ---
    # If token does not exist OR has already been revoked, a replay attack has occurred!
    # Immediately revoke all tokens belonging to this family.
    if not token_record or token_record.is_revoked:
        family_tokens = session.exec(
            select(RefreshToken).where(RefreshToken.family_id == family_id)
        ).all()
        for t in family_tokens:
            t.is_revoked = True
            session.add(t)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Güvenlik Uyarısı: Kullanılmış refresh token tespit edildi. Oturum sonlandırıldı.",
        )

    # Check expiration date
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    expires_at = token_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)

    if expires_at < now_utc:
        token_record.is_revoked = True
        session.add(token_record)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token süresi doldu.",
        )

    if str(token_record.user_id) != user_id_str:
        family_tokens = session.exec(
            select(RefreshToken).where(RefreshToken.family_id == family_id)
        ).all()
        for t in family_tokens:
            t.is_revoked = True
            session.add(t)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Güvenlik uyarısı: Kullanıcı kimliği uyuşmuyor.",
        )

    user = session.get(User, token_record.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı.",
        )

    # Mark current refresh token as revoked (single-use)
    token_record.is_revoked = True
    session.add(token_record)

    # Generate NEW refresh token preserving the same family_id
    new_token, new_jti, _, new_expires_at = create_refresh_token(
        token_record.user_id, family_id=family_id
    )
    new_record = RefreshToken(
        user_id=token_record.user_id,
        jti=new_jti,
        family_id=family_id,
        is_revoked=False,
        expires_at=new_expires_at,
    )
    session.add(new_record)
    session.commit()

    new_access_token = create_access_token(user.id, user.username)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_token,
        token_type="bearer",
        user=UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            total_score=user.total_score,
            level=user.level,
            created_at=user.created_at,
        ),
    )


@router.post("/logout")
def logout(
    req: RefreshTokenRequest,
    session: Session = Depends(get_session),
):
    try:
        payload = decode_token(req.refresh_token)
        family_id = payload.get("family_id")
        if family_id:
            # Revoke all tokens in this family
            family_tokens = session.exec(
                select(RefreshToken).where(RefreshToken.family_id == family_id)
            ).all()
            for t in family_tokens:
                t.is_revoked = True
                session.add(t)
            session.commit()
    except Exception:
        # Even if token is already expired or invalid, logout should succeed gracefully
        pass

    return {"message": "Başarıyla çıkış yapıldı."}


@router.get("/me", response_model=UserOut)
def get_me(
    user: User = Depends(get_current_user),
):
    return UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        total_score=user.total_score,
        level=user.level,
        created_at=user.created_at,
    )
