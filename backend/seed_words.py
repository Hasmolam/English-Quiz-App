from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Word

WORDS_DATA = [
    ("apple", "elma"),
    ("book", "kitap"),
    ("cat", "kedi"),
    ("door", "kapı"),
    ("elephant", "fil"),
    ("flower", "çiçek"),
    ("garden", "bahçe"),
    ("house", "ev"),
    ("island", "ada"),
    ("journey", "yolculuk"),
    ("kitchen", "mutfak"),
    ("library", "kütüphane"),
    ("mountain", "dağ"),
    ("notebook", "defter"),
    ("ocean", "okyanus"),
    ("pencil", "kalem"),
    ("queen", "kraliçe"),
    ("river", "nehir"),
    ("sun", "güneş"),
    ("tree", "ağaç"),
    ("umbrella", "şemsiye"),
    ("village", "köy"),
    ("water", "su"),
    ("yellow", "sarı"),
    ("zebra", "zebra"),
    ("bread", "ekmek"),
    ("cloud", "bulut"),
    ("dream", "rüya"),
    ("earth", "dünya"),
    ("forest", "orman"),
    ("glass", "bardak"),
    ("heart", "kalp"),
    ("ice", "buz"),
    ("jacket", "ceket"),
    ("king", "kral"),
    ("lemon", "limon"),
    ("moon", "ay"),
    ("night", "gece"),
    ("orange", "portakal"),
    ("paper", "kağıt"),
    ("rain", "yağmur"),
    ("star", "yıldız"),
    ("table", "masa"),
    ("universe", "evren"),
    ("voice", "ses"),
    ("window", "pencere"),
    ("year", "yıl"),
    ("zoo", "hayvanat bahçesi"),
]

def seed():
    create_db_and_tables()
    with Session(engine) as session:
        existing = session.exec(select(Word)).all()
        existing_words = {w.en.lower() for w in existing}
        
        new_words = []
        for en, tr in WORDS_DATA:
            if en.lower() not in existing_words:
                new_words.append(Word(en=en, tr=tr))
        
        if new_words:
            session.add_all(new_words)
            session.commit()
            print(f"Added {len(new_words)} words to the database.")
        else:
            print("Words already exist in database.")

if __name__ == "__main__":
    seed()
