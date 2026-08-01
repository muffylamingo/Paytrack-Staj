"""
main.py — FastAPI uygulamasının giriş noktası.

Sunucuyu şu komutla çalıştırırız:
    .venv\\Scripts\\python.exe -m uvicorn app.main:app --reload

- FastAPI() : uygulama nesnesi
- CORS      : farklı porttaki React'in (Faz 3) bu API'ye istek atabilmesi için izin
- /docs     : FastAPI'nin otomatik ürettiği interaktif test sayfası
"""
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import audit  # noqa: F401  (import edilmesi ŞART: olay dinleyicisini kaydeder)
from app import auth
from app.auth import get_current_user
from app.routers import audit as audit_router
from app.routers import budgets, invoices, rates, stats

app = FastAPI(
    title="PayTrack API",
    description="Kurumsal Fatura Yönetim Sistemi — Backend",
    version="0.1.0",
)

# CORS: Frontend (React) http://localhost:5173'te çalışacak ve bu API'ye (8000) istek atacak.
# Tarayıcı güvenliği gereği bu izni açıkça vermemiz lazım.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Sunucu ayakta mı? Basit sağlık kontrolü."""
    return {"mesaj": "PayTrack API çalışıyor 🚀", "docs": "/docs"}


# ---------------------------------------------------------------------------
# TÜM veri endpoint'leri Keycloak ile korunuyor (Faz 7).
# `dependencies=[Depends(get_current_user)]` router'ın TAMAMINA uygulanır —
# tek tek her fonksiyona yazmaktan hem kısa hem de UNUTMAYA KAPALI.
# (Yukarıdaki `GET /` sağlık kontrolü bilerek herkese açık.)
# ---------------------------------------------------------------------------
korumali = [Depends(get_current_user)]

# Fatura endpoint'lerini (POST/GET/PATCH/PUT/DELETE /invoices) uygulamaya bağla
app.include_router(invoices.router, dependencies=korumali)
# Dashboard özet endpoint'i (GET /stats)
app.include_router(stats.router, dependencies=korumali)
# Kategori bazlı aylık bütçeler (GET/PUT/DELETE /budgets)
app.include_router(budgets.router, dependencies=korumali)
# Döviz kurları (GET/PUT /rates)
app.include_router(rates.router, dependencies=korumali)
# İşlem geçmişi (GET /audit) — kayıtlar otomatik oluşur, burası sadece okur
app.include_router(audit_router.router, dependencies=korumali)


@app.get("/me", tags=["Kimlik"])
def me(user: auth.User = Depends(get_current_user)):
    """Giriş yapan kullanıcının bilgileri (arayüzde ad göstermek için)."""
    return {"username": user.username, "name": user.name, "email": user.email}
