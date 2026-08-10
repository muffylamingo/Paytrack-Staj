#!/bin/sh
# ============================================================================
#  Backend konteyneri açılış betiği
#
#  Sırasıyla:
#    1. PostgreSQL gerçekten hazır olana kadar bekle
#    2. Migration'ları çalıştır (tabloları oluştur/güncelle)
#    3. Örnek veriyi yükle (sadece veritabanı boşsa)
#    4. Sunucuyu başlat
#
#  NEDEN BEKLEME GEREKİYOR? docker-compose'daki "depends_on" sadece
#  konteynerin BAŞLADIĞINI garanti eder, veritabanının bağlantı kabul
#  ETMEYE HAZIR olduğunu değil. Postgres açılırken birkaç saniye
#  "the database system is starting up" der ve bağlantıyı reddeder.
# ============================================================================
set -e

echo "[paytrack] Veritabani bekleniyor..."
python - <<'PY'
import time
import sys
from sqlalchemy import text
from app.database import engine

for deneme in range(1, 61):          # en fazla ~60 saniye
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        print(f"[paytrack] Veritabani hazir ({deneme}. denemede).")
        break
    except Exception:
        time.sleep(1)
else:
    print("[paytrack] HATA: Veritabanina 60 saniyede baglanilamadi.")
    sys.exit(1)
PY

echo "[paytrack] Migration'lar calistiriliyor..."
alembic upgrade head

echo "[paytrack] Ornek veri kontrol ediliyor..."
python seed.py

echo "[paytrack] Sunucu baslatiliyor -> http://localhost:8000/docs"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
