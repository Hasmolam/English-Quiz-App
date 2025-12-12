from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

# Modüllerimizi çağırıyoruz
from database import engine
from routers import quiz

# Uygulama başlarken tabloları oluşturmak için (Lifecycle)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken çalışır
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"DB Init Error (Ignored for startup): {e}")
    yield
    # Uygulama kapanırken çalışır (gerekirse)

app = FastAPI(lifespan=lifespan)

# CORS Ayarları (Frontend erişimi için gerekli)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Güvenlik için production'da spesifik domainler girilmeli
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ana uygulamaya ekliyoruz
app.include_router(quiz.router)

@app.get("/")
def root():
    return {"message": "API Çalışıyor 🚀"}