# English Quiz App Backend

Bu proje, İngilizce kelime öğrenme uygulaması için geliştirilmiş FastAPI tabanlı bir backend servisidir.

## 🛠 Teknolojiler

- **Dil:** Python 3.12+
- **Framework:** FastAPI
- **Veritabanı:** PostgreSQL
- **ORM:** SQLModel (SQLAlchemy + Pydantic)
- **Kimlik Doğrulama:** Clerk (JWT)

## 📂 Proje Yapısı

```text
/backend
  ├── auth.py           # Clerk kimlik doğrulama ve kullanıcı yönetimi
  ├── database.py       # Veritabanı bağlantısı
  ├── main.py           # Uygulama giriş noktası ve CORS ayarları
  ├── models.py         # Veritabanı tabloları (User, Word)
  ├── routers/
  │   └── quiz.py       # Quiz ile ilgili API endpoint'leri
  ├── schemas/
  │   └── quiz.py       # Pydantic veri şemaları (Request/Response)
  └── test_auth_flow.py # Test scripti
```

## 🗄 Veritabanı Modelleri

### Users (Kullanıcılar)
- `id`: Integer (PK)
- `clerk_id`: String (Clerk'ten gelen Unique ID)
- `email`: String
- `username`: String
- `total_score`: Integer (Varsayılan: 0)
- `level`: String (Varsayılan: "A1")

### Word (Kelimeler)
- `id`: Integer (PK)
- `tr`: String (Türkçe)
- `en`: String (İngilizce)

## 🚀 API Endpoint'leri

### Quiz İşlemleri (`/quiz`)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/quiz/start` | Quiz'i başlatır. Her soru için kelime ve 4 şık (1 doğru, 3 yanlış) döndürür. |
| `POST` | `/quiz/answer` | Kullanıcının cevabını kontrol eder ve puanı günceller. |
| `GET` | `/quiz/leaderboard` | En yüksek puana sahip ilk 10 kullanıcıyı listeler. |

### Kimlik Doğrulama
Sistem **Clerk** üzerinden alınan `Bearer Token` ile çalışır. Token, `Authorization` header'ında gönderilmelidir. Backend, token'ı doğrular ve veritabanında kullanıcı yoksa otomatik oluşturur.

## ⚙️ Kurulum ve Çalıştırma

1. **Sanal Ortamı Oluştur ve Aktif Et:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Bağımlılıkları Yükle:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Çevresel Değişkenleri Ayarla (.env):**
   ```env
   SQLMODEL_DATABASE_URL="postgresql://user:password@localhost/dbname"
   CLERK_ISSUER_URL="https://your-clerk-issuer-url"
   ```

4. **Uygulamayı Başlat:**
   ```bash
   uvicorn main:app --reload
   ```

## 🧪 Test
Sistemi test etmek için hazırlanan script'i kullanabilirsiniz:
```bash
python test_auth_flow.py
```
