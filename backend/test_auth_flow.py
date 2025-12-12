from fastapi.testclient import TestClient
from main import app
from auth import get_current_user

# 1. Mock (Sahte) bir Clerk Token Payload'ı oluşturuyoruz
# Sanki Clerk'ten geçerli bir token gelmiş gibi davranacağız.
def mock_get_current_user():
    return {
        "sub": "clerk_test_user_123", # Sahte Clerk ID
        "email": "test@example.com",
        "username": "testuser"
    }

# 2. FastAPI'nin auth bağımlılığını (dependency) bu mock ile değiştiriyoruz
# Artık uygulama gerçek token kontrolü yapmak yerine yukarıdaki fonksiyonu çağıracak.
app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)

def test_user_creation():
    print("--- Test Başlıyor ---")
    
    # 1. Quiz Başlat
    print("\n1. Quiz Başlatılıyor...")
    try:
        response = client.get("/quiz/start")
        if response.status_code == 200:
            data = response.json()
            print("✅ Quiz Başlatıldı!")
            questions = data.get("questions", [])
            if not questions:
                print("❌ Soru gelmedi!")
                return
            
            first_question = questions[0]
            print(f"Soru: {first_question}")
            
            # 2. Cevap Gönder (Doğru Cevap Denemesi)
            print("\n2. Cevap Gönderiliyor (Doğru)...")
            # Doğru cevabı alıp gönderelim (Test amaçlı)
            correct_answer = first_question['en']
            answer_payload = {
                "word_id": first_question['id'],
                "answer": correct_answer
            }
            
            ans_response = client.post("/quiz/answer", json=answer_payload)
            if ans_response.status_code == 200:
                ans_data = ans_response.json()
                print(f"✅ Cevap Sonucu: {ans_data}")
                if ans_data['correct']:
                    print("   -> Doğru bilindi, puan arttı.")
                else:
                    print("   -> Yanlış bilindi (Beklenmedik durum).")
            else:
                print(f"❌ Cevap isteği başarısız: {ans_response.text}")

            # 3. Cevap Gönder (Yanlış Cevap Denemesi)
            print("\n3. Cevap Gönderiliyor (Yanlış)...")
            wrong_payload = {
                "word_id": first_question['id'],
                "answer": "sacmasapanbirsey"
            }
            wrong_response = client.post("/quiz/answer", json=wrong_payload)
            if wrong_response.status_code == 200:
                wrong_data = wrong_response.json()
                print(f"✅ Cevap Sonucu: {wrong_data}")
                if not wrong_data['correct']:
                    print("   -> Yanlış bilindi (Beklenen durum).")
            
            # 4. Leaderboard Kontrolü
            print("\n4. Leaderboard Kontrolü...")
            lb_response = client.get("/quiz/leaderboard")
            if lb_response.status_code == 200:
                lb_data = lb_response.json()
                print(f"✅ Leaderboard: {lb_data}")
            else:
                print(f"❌ Leaderboard isteği başarısız: {lb_response.text}")

        else:
            print("\n❌ Quiz başlatma başarısız!")
            print(f"Status Code: {response.status_code}")
            print(f"Hata Detayı: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Bir hata oluştu: {e}")

if __name__ == "__main__":
    test_user_creation()
