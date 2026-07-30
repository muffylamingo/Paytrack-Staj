"""
routers/stats.py — Dashboard özet verileri.
  GET /stats  -> toplam gecikmiş borç, 7 günlük yük, bu ay, kategori dağılımı, 6 aylık trend
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(tags=["İstatistik"])


@router.get("/stats", response_model=schemas.Stats)
def get_stats(db: Session = Depends(get_db)):
    """Dashboard için özet veriler."""
    return crud.get_stats(db)
