"""
seed.py — Örnek veri yükler (projeyi ilk kez çalıştıranın dolu bir ekran görmesi için).

Çalıştır (backend klasöründe):
    .venv\\Scripts\\python.exe seed.py

NE EKLER?
  • 13 örnek fatura (gecikmiş / yaklaşan / ödenmiş karışık, TRY ve USD)
  • Biri BUGÜN vadeli  -> "Bugün son ödeme günü" hatırlatıcı bandı görünsün
  • Bir tanesi AYLIK tekrarlayan -> "Tekrarları Oluştur" özelliği denenebilsin
  • 3 kategoriye aylık bütçe -> gösterge panelindeki bütçe kartı dolsun
  • USD kuru -> çoklu para birimi çevrimi görünsün

GÜVENLİ: Veritabanında zaten fatura varsa hiçbir şey yapmaz (kopya oluşmaz).
"""
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select

from app import models
from app.database import SessionLocal

BUGUN = date.today()

# (tedarikçi, kategori, tutar, döviz, son_ödeme, durum, tekrarlama)
SAMPLE = [
    ("İSKİ",             "Enerji",  "850",   "TRY", BUGUN - timedelta(days=22), "Gecikti",  None),
    ("İGDAŞ",            "Enerji",  "2100",  "TRY", BUGUN - timedelta(days=14), "Gecikti",  None),
    ("Migros Kurumsal",  "Mutfak",  "1800",  "TRY", BUGUN,                      "Bekliyor", None),  # ← BUGÜN (hatırlatıcı)
    ("Ofis Kirası",      "Kira",    "25000", "TRY", BUGUN + timedelta(days=4),  "Bekliyor", "Aylık"),  # ← tekrarlayan
    ("Microsoft 365",    "Yazılım", "600",   "TRY", BUGUN + timedelta(days=6),  "Bekliyor", None),
    ("AWS",              "Yazılım", "1250",  "USD", BUGUN + timedelta(days=12), "Bekliyor", None),
    ("Vodafone Kurumsal","Enerji",  "1450",  "TRY", BUGUN + timedelta(days=20), "Bekliyor", None),
    ("EnerjiSA",         "Enerji",  "3900",  "TRY", BUGUN - timedelta(days=58), "Ödendi",   None),
    ("Ofis Kirası",      "Kira",    "25000", "TRY", BUGUN - timedelta(days=31), "Ödendi",   None),
    ("GitHub",           "Yazılım", "210",   "USD", BUGUN - timedelta(days=74), "Ödendi",   None),
    ("Migros Kurumsal",  "Mutfak",  "1500",  "TRY", BUGUN - timedelta(days=66), "Ödendi",   None),
    ("İGDAŞ",            "Enerji",  "2600",  "TRY", BUGUN - timedelta(days=115), "Ödendi",  None),
    ("Ofis Kirası",      "Kira",    "24000", "TRY", BUGUN - timedelta(days=153), "Ödendi",  None),
]

# (kategori, aylık limit) — panelde "İyi / Uyarı / Aşıldı" üçünü de göstersin
BUDGETS = [("Enerji", "5000"), ("Kira", "24000"), ("Mutfak", "2000")]

# (para birimi, 1 birimi kaç TL)
RATES = [("USD", "42.75"), ("EUR", "46.20")]


def run() -> None:
    db = SessionLocal()
    try:
        # Zaten veri varsa dokunma (yanlışlıkla iki kez çalıştırınca kopya olmasın)
        if db.scalar(select(models.Invoice).limit(1)):
            print("Veritabaninda zaten fatura var - ornek veri EKLENMEDI.")
            print("Sifirdan yuklemek istersen once faturalari silmelisin.")
            return

        for i, (vendor, cat, amt, cur, due, status, rec) in enumerate(SAMPLE, start=101):
            db.add(
                models.Invoice(
                    invoice_number=f"FTR-2026-{i:03d}",
                    vendor_name=vendor,
                    category=cat,
                    amount=Decimal(amt),
                    currency=cur,
                    due_date=due,
                    status=status,
                    recurrence=rec,
                )
            )

        for cat, limit in BUDGETS:
            db.add(models.Budget(category=cat, monthly_limit=Decimal(limit), currency="TRY"))

        for cur, rate in RATES:
            db.add(models.ExchangeRate(currency=cur, rate=Decimal(rate)))

        db.commit()
        print(f"OK - {len(SAMPLE)} fatura, {len(BUDGETS)} butce, {len(RATES)} kur eklendi.")
        print("Ipucu: Faturalar sayfasindaki 'Tekrarlari Olustur' butonunu deneyebilirsin.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
