"""
config.py — Uygulama ayarları.

.env dosyasındaki gizli bilgileri (veritabanı adresi gibi) güvenli şekilde okur.
Böylece şifreyi kodun içine yazmayız; .env dosyası da .gitignore'da olduğu için
git'e sızmaz.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ klasörünün tam yolu:  config.py -> app/ -> backend/
# (Böylece komutu hangi klasörden çalıştırırsak çalıştıralım .env'i buluruz.)
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # .env içindeki DATABASE_URL bu alana OTOMATİK okunur.
    database_url: str

    # --- Keycloak (Faz 7) ---
    keycloak_url: str = "http://localhost:8080"
    keycloak_realm: str = "paytrack"
    keycloak_client_id: str = "paytrack-frontend"
    # Geliştirirken doğrulamayı kapatmak için .env'e AUTH_DISABLED=true yazılabilir.
    # ÜRETİMDE ASLA true olmamalı.
    auth_disabled: bool = False

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",   # hangi .env dosyası okunacak
        env_file_encoding="utf-8",
        extra="ignore",                  # beklenmeyen değişkenleri görmezden gel
    )


# Uygulamanın her yerinden "settings.database_url" diye erişeceğimiz tek nesne.
settings = Settings()
