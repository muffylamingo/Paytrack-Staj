"""
main.py — FastAPI uygulamasının giriş noktası.

Sunucuyu şu komutla çalıştırırız:
    .venv\\Scripts\\python.exe -m uvicorn app.main:app --reload

- FastAPI() : uygulama nesnesi
- CORS      : farklı porttaki React'in (Faz 3) bu API'ye istek atabilmesi için izin
- /docs     : FastAPI'nin otomatik ürettiği interaktif test sayfası
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


# Fatura endpoint'lerini (POST/GET/PATCH/PUT/DELETE /invoices) uygulamaya bağla
app.include_router(invoices.router)
# Dashboard özet endpoint'i (GET /stats)
app.include_router(stats.router)
# Kategori bazlı aylık bütçeler (GET/PUT/DELETE /budgets)
app.include_router(budgets.router)
# Döviz kurları (GET/PUT /rates)
app.include_router(rates.router)
