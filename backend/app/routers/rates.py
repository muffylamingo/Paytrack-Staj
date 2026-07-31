"""
routers/rates.py — Döviz kuru endpoint'leri (Ekstra Özellik #8).

  GET /rates            -> kurları listele (kaydedilmemişse varsayılan gösterilir)
  PUT /rates/{currency} -> kuru güncelle

Kur "1 birim yabancı para kaç TL?" olarak tutulur (örn. USD -> 40.00).
TRY düzenlenemez: kendi kuru tanımı gereği 1'dir.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/rates", tags=["Döviz Kurları"])


@router.get("", response_model=list[schemas.ExchangeRateOut])
def list_rates(db: Session = Depends(get_db)):
    """Kur listesi. `is_default: true` ise henüz kaydedilmemiş, varsayılan değerdir."""
    return crud.list_rates(db)


@router.put("/{currency}", response_model=schemas.ExchangeRateOut)
def set_rate(currency: schemas.Currency, data: schemas.ExchangeRateIn, db: Session = Depends(get_db)):
    """Bir para biriminin TL kurunu günceller."""
    if currency == schemas.Currency.try_:
        raise HTTPException(status_code=400, detail="TRY kuru değiştirilemez (her zaman 1).")
    row = crud.upsert_rate(db, currency.value, data.rate)
    return {
        "currency": row.currency,
        "rate": row.rate,
        "is_default": False,
        "updated_at": row.updated_at,
    }
