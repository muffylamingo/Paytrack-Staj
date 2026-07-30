"""
crud.py — Veritabanı işlemleri (Create-Read-Update-Delete + istatistik).

"Katmanlı mimari": router'lar sadece HTTP ile ilgilenir, asıl veritabanı işini bu katman yapar.
"""
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas, storage

# Sıralanabilir sütunlar (kullanıcı bunların dışında bir şey gönderemez = güvenli)
SORTABLE = {
    "due_date": models.Invoice.due_date,
    "amount": models.Invoice.amount,
    "vendor_name": models.Invoice.vendor_name,
    "invoice_number": models.Invoice.invoice_number,
    "status": models.Invoice.status,
    "category": models.Invoice.category,
    "created_at": models.Invoice.created_at,
}


def create_invoice(db: Session, data: schemas.InvoiceCreate) -> models.Invoice:
    """Yeni fatura oluşturur ve veritabanına kaydeder."""
    invoice = models.Invoice(**data.model_dump())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def get_invoices(
    db: Session,
    status: str | None = None,
    category: str | None = None,
    vendor: str | None = None,
    sort: str = "due_date",
    order: str = "asc",
) -> list[models.Invoice]:
    """Faturaları listeler. Filtre (status/category/vendor) ve sıralama (sort/order) uygular."""
    query = select(models.Invoice)
    if status:
        query = query.where(models.Invoice.status == status)
    if category:
        query = query.where(models.Invoice.category == category)
    if vendor:
        query = query.where(models.Invoice.vendor_name.ilike(f"%{vendor}%"))

    column = SORTABLE.get(sort, models.Invoice.due_date)
    query = query.order_by(column.desc() if order == "desc" else column.asc())

    return list(db.scalars(query).all())


def get_invoice(db: Session, invoice_id: int) -> models.Invoice | None:
    return db.get(models.Invoice, invoice_id)


def update_invoice(db: Session, invoice: models.Invoice, data: schemas.InvoiceUpdate) -> models.Invoice:
    """Faturanın SADECE gönderilen alanlarını günceller."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(invoice, field, value)
    db.commit()
    db.refresh(invoice)
    return invoice


def mark_paid(db: Session, invoice: models.Invoice) -> models.Invoice:
    """Faturayı 'Ödendi' yapar ve ödeme zamanını kaydeder."""
    invoice.status = schemas.InvoiceStatus.odendi.value
    invoice.paid_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(invoice)
    return invoice


def delete_invoice(db: Session, invoice: models.Invoice) -> None:
    # Fatura silinirse ekindeki dosya diskte "öksüz" kalmasın
    storage.delete_file(invoice.attachment_path)
    db.delete(invoice)
    db.commit()


def set_attachment(
    db: Session, invoice: models.Invoice, stored_name: str, original_name: str
) -> models.Invoice:
    """Faturaya ek dosya bağlar. Eskisi varsa diskten siler (çöp birikmesin)."""
    storage.delete_file(invoice.attachment_path)
    invoice.attachment_path = stored_name
    invoice.attachment_name = original_name
    db.commit()
    db.refresh(invoice)
    return invoice


def clear_attachment(db: Session, invoice: models.Invoice) -> models.Invoice:
    """Ek dosyayı hem diskten hem kayıttan kaldırır."""
    storage.delete_file(invoice.attachment_path)
    invoice.attachment_path = None
    invoice.attachment_name = None
    db.commit()
    db.refresh(invoice)
    return invoice


def get_stats(db: Session) -> dict:
    """Dashboard için özet hesaplar (3 KPI + kategori dağılımı + 6 aylık trend)."""
    invoices = list(db.scalars(select(models.Invoice)).all())
    today = date.today()
    week_later = today + timedelta(days=7)

    total_overdue = Decimal("0")
    due_next_7 = Decimal("0")
    this_month = Decimal("0")
    unpaid_count = 0
    overdue_count = 0
    due_today: list[dict] = []
    by_cat: dict[str, Decimal] = {}
    monthly: dict[str, Decimal] = {}

    for inv in invoices:
        amt = inv.amount or Decimal("0")

        # Kategori dağılımı (pasta grafik)
        by_cat[inv.category] = by_cat.get(inv.category, Decimal("0")) + amt
        # Aylık toplam (çizgi grafik) — son ödeme ayına göre
        mkey = inv.due_date.strftime("%Y-%m")
        monthly[mkey] = monthly.get(mkey, Decimal("0")) + amt

        if inv.status != "Ödendi":
            unpaid_count += 1
            if inv.due_date < today:
                total_overdue += amt
                overdue_count += 1
            elif today <= inv.due_date <= week_later:
                due_next_7 += amt

            # Son ödeme tarihi TAM BUGÜN olanlar (hatırlatıcı için)
            if inv.due_date == today:
                due_today.append(
                    {"id": inv.id, "vendor_name": inv.vendor_name, "amount": amt, "currency": inv.currency}
                )

        # Bu ayın toplamı (son ödeme tarihi bu ay olanlar)
        if inv.due_date.year == today.year and inv.due_date.month == today.month:
            this_month += amt

    # Son 6 ayı (bu ay dahil) sıralı üret; veri yoksa 0
    trend = []
    for i in range(5, -1, -1):
        mm = today.month - i
        yy = today.year
        while mm <= 0:
            mm += 12
            yy -= 1
        key = f"{yy:04d}-{mm:02d}"
        trend.append({"month": key, "total": monthly.get(key, Decimal("0"))})

    by_category = [{"category": c, "total": t} for c, t in by_cat.items()]

    return {
        "total_overdue": total_overdue,
        "due_next_7_days": due_next_7,
        "this_month_total": this_month,
        "unpaid_count": unpaid_count,
        "overdue_count": overdue_count,
        "due_today": due_today,
        "by_category": by_category,
        "monthly_trend": trend,
    }
