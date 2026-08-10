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
    # Varsayılan değer docker-compose.yml ile birebir aynı: projeyi ilk kez
    # klonlayan biri .env oluşturmasa bile uygulama çalışsın (aksi hâlde
    # anlaşılmaz bir "field required" hatasıyla karşılaşırdı).
    # Gerçek bir kurulumda bu değer MUTLAKA .env'den gelir.
    database_url: str = "postgresql+psycopg://paytrack:paytrack@localhost:5432/paytrack"

    # --- Keycloak (Faz 7) ---
    # DIŞARIDAN görünen adres. Token'ın içindeki "issuer" alanı bununla
    # birebir aynı olmak zorunda — tarayıcı Keycloak'a bu adresten gittiği için.
    keycloak_url: str = "http://localhost:8080"

    # SUNUCUDAN sunucuya erişim adresi (açık anahtarları/JWKS indirmek için).
    # Neden ayrı? Docker içinde çalışırken backend "localhost:8080"e ulaşamaz —
    # oradaki localhost kendi konteyneridir. Servis adını kullanması gerekir
    # (http://keycloak:8080). Ama token'daki issuer yine "localhost:8080" olur.
    # Boş bırakılırsa keycloak_url kullanılır (Docker'sız çalışma).
    keycloak_internal_url: str | None = None
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
