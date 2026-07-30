# 💼 PayTrack — Kurumsal Fatura Yönetim Sistemi

ODAKENT Stajyer Öğrenci Programı kapsamında geliştirilen; şirketlerin gelen faturalarını kaydettiği,
ödeme durumlarını takip ettiği ve aylık harcamalarını raporladığı bir web uygulaması.

## ✨ Özellikler
- 📋 Fatura CRUD (ekle, listele, güncelle, sil, "Ödendi" işaretle)
- 🔍 Arama + durum/kategori filtreleri + sütuna göre artan/azalan sıralama
- 📊 Dashboard: 3 KPI kartı + kategori (pasta) & son 6 ay (çizgi) grafikleri
- 📥 Excel (.xlsx) dışa aktarma
- 🎨 "Organic" temalı, modern arayüz
- 🔴 Son ödemesi yaklaşan faturalar kırmızı ile vurgulanır

## 🧱 Teknoloji Yığını
| Katman | Teknoloji |
|--------|-----------|
| Frontend | React (Vite), Tailwind CSS v4, Recharts, React Router, axios |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic |
| Veritabanı | PostgreSQL (Docker) |
| Raporlama | openpyxl (Excel) |

## 🚀 Çalıştırma
Ayrıntılı adımlar: **[KOMUTLAR.md](KOMUTLAR.md)**. Özetle:

1. **Veritabanı:** Docker Desktop'ı aç, sonra proje kökünde:
   ```bash
   docker compose up -d
   ```
2. **Backend** (http://localhost:8000/docs):
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\python.exe -m pip install -r requirements.txt
   .venv\Scripts\python.exe -m uvicorn app.main:app --reload
   ```
3. **Frontend** (http://localhost:5173):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📁 Proje Yapısı
- `backend/` — FastAPI API (`app/`, `alembic/`, `seed.py`)
- `frontend/` — React arayüz (`src/`)
- `PLAN.md` — proje planı · `ILERLEME.md` — ilerleme panosu · `CALISMA-NOTLARI.md` — öğrenme notları

---
🎓 Bir stajyer öğrenme projesi.
