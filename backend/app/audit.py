"""
audit.py — Otomatik işlem geçmişi (Ekstra Özellik #10).

FİKİR: Her endpoint'e "şimdi de log yaz" satırı eklemek yerine, SQLAlchemy'nin
OLAY SİSTEMİNİ kullanıyoruz. `before_flush` olayı, veritabanına yazılmadan hemen
önce tetiklenir ve o anda oturumda (session) ne olduğunu gösterir:

    session.new     -> yeni eklenen nesneler
    session.dirty   -> değiştirilen nesneler
    session.deleted -> silinen nesneler

Böylece yarın yeni bir endpoint yazan kişi log eklemeyi UNUTAMAZ; sistem
kendiliğinden kaydeder. Kurumsal sistemlerde bu tür "çapraz kesen" işler
(loglama, yetki, önbellek) hep böyle merkezî çözülür.
🔎 "sqlalchemy event before_flush", "cross-cutting concerns"
"""
import json
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import event, inspect
from sqlalchemy.orm import Session

from app import models

# Hangi tablolar izlensin? (AuditLog'un kendisi burada YOK -> sonsuz döngü olmaz)
TRACKED: dict[type, str] = {
    models.Invoice: "invoice",
    models.Budget: "budget",
    models.ExchangeRate: "rate",
}

# Bu alanların değişmesi "kullanıcı işlemi" sayılmaz, log'u kirletir
IGNORED_FIELDS = {"created_at", "updated_at", "attachment_path"}


def _label(obj) -> str:
    """Kaydı insanın tanıyacağı kısa bir isim ver."""
    if isinstance(obj, models.Invoice):
        return obj.invoice_number or f"#{obj.id}"
    if isinstance(obj, models.Budget):
        return obj.category
    if isinstance(obj, models.ExchangeRate):
        return obj.currency
    return str(getattr(obj, "id", "?"))


def _serialize(value):
    """Decimal/tarih gibi tipleri JSON'a yazılabilir hale getirir."""
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def _changed_fields(obj) -> dict:
    """
    Nesnenin hangi alanı ne olmuş? -> {"amount": {"old": "100.00", "new": "150.00"}}

    SQLAlchemy her alan için bir "history" tutar:
      history.deleted -> eski değer(ler)
      history.added   -> yeni değer(ler)
    """
    changes: dict = {}
    state = inspect(obj)
    for attr in state.attrs:
        if attr.key in IGNORED_FIELDS:
            continue
        history = attr.history
        if not history.has_changes():
            continue
        old = history.deleted[0] if history.deleted else None
        new = history.added[0] if history.added else None
        if old == new:
            continue
        changes[attr.key] = {"old": _serialize(old), "new": _serialize(new)}
    return changes


def _log(session: Session, obj, action: str, changes: dict | None = None) -> None:
    entity = TRACKED.get(type(obj))
    if not entity:
        return
    session.add(
        models.AuditLog(
            entity=entity,
            entity_id=getattr(obj, "id", None),
            entity_label=_label(obj),
            action=action,
            changes=json.dumps(changes, ensure_ascii=False) if changes else None,
            username=None,  # Keycloak (Faz 7) gelince buraya kullanıcı adı yazılacak
        )
    )


@event.listens_for(Session, "before_flush")
def _capture_changes(session: Session, flush_context, instances) -> None:
    """Veritabanına yazılmadan HEMEN ÖNCE çalışır; değişiklikleri log'a çevirir."""
    # Not: session.new/dirty/deleted üzerinde dönerken session'a ekleme yapmak
    # güvenlidir (before_flush bunun için tasarlanmıştır). Yine de listeye
    # çevirip (list(...)) döngü sırasında değişmesini engelliyoruz.
    # NOT: Yeni kayıtların id'si henüz OLUŞMAMIŞTIR (id'yi veritabanı flush
    # sırasında üretir), bu yüzden "create" loglarında entity_id boş kalır.
    # Sorun değil: kaydı `entity_label` ile (örn. "FTR-2026-113") tanıyoruz.
    # Yeni nesne eklemek için güvenli olan tek olay `before_flush` olduğundan
    # bilinçli bir tercih. 🔎 "sqlalchemy session events flush"
    for obj in list(session.new):
        _log(session, obj, "create")

    for obj in list(session.dirty):
        if not session.is_modified(obj, include_collections=False):
            continue
        changes = _changed_fields(obj)
        if changes:  # sadece gerçekten bir şey değiştiyse
            _log(session, obj, "update", changes)

    for obj in list(session.deleted):
        _log(session, obj, "delete")
