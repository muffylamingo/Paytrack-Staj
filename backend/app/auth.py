"""
auth.py — Keycloak ile kullanıcı doğrulama (Faz 7 / PDF challenge görevi).

NASIL ÇALIŞIR?
  1. Kullanıcı Keycloak'ın giriş ekranında şifresini girer (bizim uygulamamız
     şifreyi HİÇ görmez — bu bir güvenlik avantajıdır).
  2. Keycloak imzalı bir "access token" (JWT) verir.
  3. Frontend her istekte bunu `Authorization: Bearer <token>` başlığıyla yollar.
  4. Burası token'ın İMZASINI doğrular. İmza geçerliyse içindeki bilgilere
     (kullanıcı adı vb.) güvenebiliriz.

JWT NEDİR? Üç parçadan oluşan, noktalarla ayrılmış bir metin:
     header.payload.signature
  İçerik (payload) şifreli DEĞİL, herkes okuyabilir — ama imzalı olduğu için
  KİMSE İÇERİĞİ DEĞİŞTİREMEZ (değiştirirse imza tutmaz).

İmzayı neyle doğruluyoruz? Keycloak açık anahtarlarını (public key) şu adreste
yayınlar: /protocol/openid-connect/certs  (JWKS). PyJWKClient bunları indirip
önbelleğe alır; her istekte Keycloak'a gitmeye gerek kalmaz.
🔎 "jwt nedir", "json web key set jwks", "asimetrik imza public key"
"""
from contextvars import ContextVar

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientError, PyJWKError as _PyJWKError

# Anahtar bulma sırasında çıkabilecek iki hatayı tek isimde topluyoruz
PyJWKError = (_PyJWKError, PyJWKClientError)

from app.config import settings

# Keycloak adresleri
ISSUER = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}"
JWKS_URL = f"{ISSUER}/protocol/openid-connect/certs"

# Açık anahtarları indirip önbellekte tutar (her istekte ağa çıkmaz)
_jwk_client = PyJWKClient(JWKS_URL, cache_keys=True)

# Swagger'da "Authorize" düğmesi çıksın diye
_bearer = HTTPBearer(auto_error=False)

# O anki isteğin kullanıcısı. İşlem geçmişi (audit.py) buradan okuyor.
# ContextVar: her istek/görev için AYRI değer tutar (global değişkenden farkı bu).
# 🔎 "python contextvars"
current_username: ContextVar[str | None] = ContextVar("current_username", default=None)


class User:
    """Token'dan çıkardığımız basit kullanıcı bilgisi."""

    def __init__(self, payload: dict):
        self.username: str = payload.get("preferred_username", "?")
        self.name: str = payload.get("name") or self.username
        self.email: str | None = payload.get("email")

    def __repr__(self) -> str:
        return f"User({self.username})"


def _unauthorized(detail: str) -> HTTPException:
    # 401 + WWW-Authenticate başlığı: "kimliğini doğrula" demenin standart yolu
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User:
    """
    Korumalı endpoint'lerde `Depends(get_current_user)` olarak kullanılır.
    Token yoksa/geçersizse 401 döner; geçerliyse kullanıcıyı verir.

    NEDEN `async def`? `current_username` bir ContextVar. FastAPI, NORMAL (`def`)
    bağımlılıkları ayrı bir iş parçacığında (threadpool) çalıştırır; orada
    ContextVar'a yazılan değer isteğin geri kalanına YANSIMAZ ve işlem geçmişi
    kullanıcıyı "Sistem" olarak kaydeder. `async def` ile aynı bağlamda kaldığı
    için değer düzgün taşınır. 🔎 "fastapi sync dependency threadpool contextvar"
    """
    if settings.auth_disabled:
        # Geliştirme kolaylığı: .env'de AUTH_DISABLED=true ise doğrulama atlanır.
        # ÜRETİMDE ASLA açık bırakılmaz.
        return User({"preferred_username": "gelistirme", "name": "Geliştirme Modu"})

    if credentials is None:
        raise _unauthorized("Giriş yapmalısınız")

    # Token'ın imzasını hangi açık anahtarla doğrulayacağımızı bul.
    # DİKKAT: Bu çağrı jwt.InvalidTokenError DEĞİL, PyJWKClientError fırlatır
    # (örn. token'da tanınmayan bir "kid" varsa). Ayrı yakalanmazsa 401 yerine
    # 500 döner — yani "geçersiz oturum" hatası "sunucu çöktü"ye dönüşür.
    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(credentials.credentials)
    except PyJWKError as e:
        raise _unauthorized("Geçersiz oturum (imza anahtarı tanınmadı)") from e
    except jwt.InvalidTokenError as e:
        # Token hiç JWT bile değilse ("abc.def.ghi") çözümleme burada patlar
        raise _unauthorized("Geçersiz oturum (token okunamadı)") from e

    try:
        payload = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["RS256"],
            issuer=ISSUER,
            # Keycloak access token'ında "aud" genelde "account" olur; bizim için
            # anlamlı olan "azp" (yetkili taraf) alanıdır, onu aşağıda kontrol ediyoruz.
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError as e:
        raise _unauthorized("Oturum süresi doldu, tekrar giriş yapın") from e
    except jwt.InvalidTokenError as e:
        raise _unauthorized(f"Geçersiz oturum: {e}") from e

    # Token gerçekten BİZİM uygulamamız için mi verilmiş?
    if payload.get("azp") != settings.keycloak_client_id:
        raise _unauthorized("Bu oturum bu uygulamaya ait değil")

    user = User(payload)
    # İşlem geçmişine "kim yaptı" yazılabilsin diye kaydet
    current_username.set(user.username)
    return user
