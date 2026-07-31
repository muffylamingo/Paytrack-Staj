"""
routers/audit.py — İşlem geçmişi endpoint'i (Ekstra Özellik #10).

  GET /audit?entity=&action=&limit=  -> en yeniden eskiye doğru kayıtlar

Kayıtlar buraya ELLE yazılmaz; app/audit.py'deki SQLAlchemy olay dinleyicisi
her değişikliği otomatik ekler. Bu endpoint sadece OKUR.
Silme/düzenleme endpoint'i BİLEREK yok: denetim kaydı değiştirilebiliyorsa
denetim kaydı olmaktan çıkar.
"""
import json
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/audit", tags=["İşlem Geçmişi"])


@router.get("", response_model=list[schemas.AuditLogOut])
def list_audit(
    entity: Literal["invoice", "budget", "rate"] | None = Query(default=None),
    action: Literal["create", "update", "delete"] | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """İşlem geçmişini listeler (en yeni en üstte)."""
    query = select(models.AuditLog).order_by(models.AuditLog.created_at.desc(), models.AuditLog.id.desc())
    if entity:
        query = query.where(models.AuditLog.entity == entity)
    if action:
        query = query.where(models.AuditLog.action == action)

    rows = db.scalars(query.limit(limit)).all()

    # changes sütunu JSON METNİ olarak saklanıyor; API'de düzgün bir listeye çeviriyoruz
    sonuc = []
    for row in rows:
        degisiklikler = []
        if row.changes:
            try:
                for field, ch in json.loads(row.changes).items():
                    degisiklikler.append(
                        {
                            "field": field,
                            "old": None if ch.get("old") is None else str(ch["old"]),
                            "new": None if ch.get("new") is None else str(ch["new"]),
                        }
                    )
            except (ValueError, AttributeError):
                pass  # bozuk JSON log'u yüzünden sayfa çökmesin
        sonuc.append(
            {
                "id": row.id,
                "entity": row.entity,
                "entity_id": row.entity_id,
                "entity_label": row.entity_label,
                "action": row.action,
                "username": row.username,
                "created_at": row.created_at,
                "changes": degisiklikler,
            }
        )
    return sonuc
