"""
routers/budgets.py — Kategori bazlı aylık bütçe endpoint'leri (Ekstra Özellik #6).

  GET    /budgets              -> tüm bütçeler + bu ayki harcama + doluluk yüzdesi
  PUT    /budgets/{kategori}   -> bütçe belirle/güncelle (upsert)
  DELETE /budgets/{kategori}   -> bütçeyi kaldır

Not: Kategori, URL'de yol parametresi olarak geliyor ve tipi schemas.Category
(Enum). Böylece "Yazilim" gibi yanlış bir değer FastAPI tarafından otomatik
reddedilir — kendi if'imizi yazmamıza gerek kalmaz.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/budgets", tags=["Bütçeler"])


@router.get("", response_model=list[schemas.BudgetStatus])
def list_budgets(db: Session = Depends(get_db)):
    """Bütçeleri, bu ayki harcama ve doluluk oranıyla birlikte listeler."""
    return crud.get_budget_status(db)


@router.put("/{category}", response_model=schemas.BudgetStatus)
def set_budget(
    category: schemas.Category,
    data: schemas.BudgetIn,
    db: Session = Depends(get_db),
):
    """Kategoriye aylık bütçe belirler (varsa günceller)."""
    crud.upsert_budget(db, category.value, data)
    # Kaydettikten sonra GÜNCEL durumu (harcama/yüzde dahil) döndürüyoruz ki
    # arayüz ikinci bir istek atmak zorunda kalmasın.
    statuses = crud.get_budget_status(db)
    return next(s for s in statuses if s["category"] == category.value)


@router.delete("/{category}", status_code=204)
def remove_budget(category: schemas.Category, db: Session = Depends(get_db)):
    """Kategorinin bütçesini kaldırır."""
    budget = crud.get_budget(db, category.value)
    if not budget:
        raise HTTPException(status_code=404, detail="Bu kategoride bütçe yok")
    crud.delete_budget(db, budget)
