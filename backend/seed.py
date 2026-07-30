"""
seed.py — Örnek fatura verisi ekler (dashboard'un canlı görünmesi için).

Çalıştır (backend klasöründe):
    .venv\\Scripts\\python.exe seed.py

İstediğin zaman bu örnekleri arayüzden silebilirsin.
"""
from datetime import date
from decimal import Decimal

from app.database import SessionLocal
from app import models

# (tedarikçi, kategori, tutar, döviz, son_ödeme, durum)
SAMPLE = [
    ("İSKİ", "Enerji", "850", "TRY", date(2026, 7, 10), "Gecikti"),
    ("İGDAŞ", "Enerji", "2100", "TRY", date(2026, 7, 18), "Gecikti"),
    ("Ofis Kirası", "Kira", "25000", "TRY", date(2026, 8, 1), "Bekliyor"),
    ("Migros Kurumsal", "Mutfak", "1800", "TRY", date(2026, 7, 30), "Bekliyor"),
    ("Microsoft 365", "Yazılım", "600", "TRY", date(2026, 8, 3), "Bekliyor"),
    ("EnerjiSA", "Enerji", "3900", "TRY", date(2026, 6, 5), "Ödendi"),
    ("Ofis Kirası", "Kira", "25000", "TRY", date(2026, 7, 1), "Ödendi"),
    ("GitHub", "Yazılım", "210", "USD", date(2026, 5, 20), "Ödendi"),
    ("Migros Kurumsal", "Mutfak", "1500", "TRY", date(2026, 5, 28), "Ödendi"),
    ("İGDAŞ", "Enerji", "2600", "TRY", date(2026, 4, 10), "Ödendi"),
    ("Ofis Kirası", "Kira", "24000", "TRY", date(2026, 3, 1), "Ödendi"),
    ("AWS", "Yazılım", "1180", "USD", date(2026, 6, 10), "Ödendi"),
]


def run():
    db = SessionLocal()
    try:
        n = 100
        for vendor, cat, amt, cur, due, status in SAMPLE:
            n += 1
            db.add(
                models.Invoice(
                    invoice_number=f"FTR-2026-{n:03d}",
                    vendor_name=vendor,
                    category=cat,
                    amount=Decimal(amt),
                    currency=cur,
                    due_date=due,
                    status=status,
                )
            )
        db.commit()
        print(f"OK - {len(SAMPLE)} ornek fatura eklendi.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
