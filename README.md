### 1. Veritabanı Tasarımı (PostgreSQL)

Bir quiz uygulamasının kalbi verilerdir. İlişkisel bir veritabanı yapısı en uygunudur.

#### Tablolar

*   **Users (Kullanıcılar)**
    
    *   id (PK): UUID veya Integer
        
    *   username: String (Unique)
        
    *   email: String
        
    *   password_hash: String
        
    *   total_score: Integer (Genel puan)
        
    *   level: String (A1, A2, B1 vb. seviyesi)
        
*   **Categories (Kategoriler)**
    
    *   id (PK): Integer
        
    *   name: String (Örn: "Günlük Hayat", "İş İngilizcesi", "A1 Kelimeleri")
        
    *   icon: String (Frontend ikon adı)
        
*   **Words (Kelimeler)**
    
    *   id (PK): Integer
        
    *   category_id: FK (Categories tablosuna)
        
    *   english_word: String (Soru)
        
    *   turkish_meaning: String (Doğru cevap)
        
    *   distractors: JSON/Array (Yanlış cevaplar - opsiyonel, backend dinamik de üretebilir)
        
    *   difficulty: Integer (1-5 arası zorluk)
        
*   **UserProgress (Kullanıcı İlerlemesi)**
    
    *   id (PK): Integer
        
    *   user_id: FK
        
    *   word_id: FK
        
    *   is_learned: Boolean (Kullanıcı bu kelimeyi tamamen öğrendi mi?)
        
    *   correct_count: Integer (Kaç kez doğru bildi?)
        
    *   last_reviewed_at: DateTime (Aralıklı tekrar sistemi için)
        

### 2. Backend Mimarisi (FastAPI)

FastAPI tarafında temiz bir yapı ve Pydantic modelleri kullanacağız.

#### Klasör Yapısı (Öneri)

```text
/backend
  /app
    /routers      # API Endpoint'leri (auth.py, quiz.py, users.py)
    /models       # SQLAlchemy tabloları
    /schemas      # Pydantic modelleri (Veri doğrulama)
    /core         # Config, Security (JWT), Database connection
    main.py       # Uygulama giriş noktası
```

#### API Endpoint'leri (Rotalar)

**A. Authentication (Auth)**

*   POST /auth/register: Yeni kullanıcı kaydı.
    
*   POST /auth/login: Giriş yap ve **JWT Token** al.
    

**B. Quiz & Kelimeler**

*   GET /quiz/categories: Tüm kategorileri listele.
    
*   GET /quiz/start?category_id=1&count=10: Quiz başlat.
    
    *   _Mantık:_ Belirtilen kategoriden kullanıcıya sorulmamış veya "ezberlenmemiş" 10 kelime çeker. Yanına 3 tane rastgele yanlış cevap ekleyip gönderir.
        
*   POST /quiz/submit: Cevabı gönder.
    
    *   _Body:_ { "word_id": 5, "answer": "Elma" }
        
    *   _Mantık:_ Cevap doğruysa UserProgress tablosunda correct_count artar, puan eklenir.
        

**C. Profil**

*   GET /users/me: Kullanıcının puanını ve seviyesini getir.
    
*   GET /users/leaderboard: En yüksek puanlı kullanıcıları getir.
    

### 3. Frontend Mimarisi (Expo / React Native)

Expo tarafında modern "Expo Router" veya "React Navigation" kullanabilirsin.

#### Ekranlar (Screens)

1.  **Welcome / Auth Screen:** Giriş yap veya Kayıt ol butonları.
    
2.  **Home Screen (Dashboard):**
    
    *   Kullanıcının mevcut seviyesi ve puanı.
        
    *   "Hemen Başla" butonu.
        
    *   Kategori listesi (Kartlar halinde).
        
3.  **Quiz Screen (Oyun Ekranı):**
    
    *   Üstte: İlerleme çubuğu (Progress Bar) ve Süre.
        
    *   Ortada: İngilizce Kelime (Büyük fontla).
        
    *   Altta: 4 seçenekli butonlar (Şıklar).
        
    *   _Animasyon:_ Doğru/Yanlış cevapta Lottie animasyonları veya renk değişimi.
        
4.  **Result Screen (Sonuç):**
    
    *   "10 soruda 8 doğru!"
        
    *   Kazanılan puan.
        
    *   Yanlış yapılan kelimelerin listesi ve doğruları.
        
    *   "Tekrar Oyna" veya "Ana Sayfa" butonu.
        
5.  **Profile / Settings:**
    
    *   Öğrenilen kelime sayısı.
        
    *   Çıkış yap.
        

#### State Management (Durum Yönetimi)

*   **Zustand** veya **React Context** kullanmanı öneririm (Redux bu proje için fazla karmaşık olabilir).
    
*   Kullanıcı oturum bilgisi (Token) ve tema (Dark/Light mode) burada tutulur.
    

### 4. Örnek Veri Akışı (Flow)

1.  Kullanıcı uygulamayı açar, Login olur.
    
2.  Backend bir access_token döner, Expo bunu SecureStore içinde saklar.
    
3.  Kullanıcı "A1 Seviyesi"ni seçer.
    
4.  Expo -> GET /quiz/start?category=A1 isteği atar.
    
5.  JSON[ { "id": 101, "word": "Apple", "options": ["Elma", "Armut", "Masa", "Kalem"], "correct_option_index": 0 // Bu bilgiyi frontend'e göndermeyip cevabı backend'de kontrol etmek daha güvenlidir ama basitlik için gönderilebilir. }]
    
6.  Kullanıcı şıkları işaretler. Her cevapta Expo -> POST /quiz/submit isteği atar veya quiz bitince toplu gönderir.