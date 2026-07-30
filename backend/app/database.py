"""
database.py — Veritabanı bağlantısının kurulduğu yer.

- engine       : PostgreSQL'e bağlanan "motor"
- SessionLocal : her işlem için bir "oturum" (session) üreten fabrika
- Base         : tüm tablo sınıflarımızın miras alacağı taban sınıf
- get_db       : FastAPI'de her istekte oturum açıp iş bitince kapatan yardımcı
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# Veritabanına bağlanan motor. (echo=True yaparsak çalışan tüm SQL'leri konsolda görürüz.)
engine = create_engine(settings.database_url, echo=False)

# Her işlem için yeni bir oturum üretir. Oturum = "veritabanıyla tek bir konuşma".
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Tüm tablolarımız bu sınıftan miras alacak. SQLAlchemy tabloları buradan tanır."""
    pass


def get_db():
    """
    FastAPI endpoint'lerinde kullanacağız (Faz 2).
    İstek gelince bir oturum açar, iş bitince otomatik kapatır.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
