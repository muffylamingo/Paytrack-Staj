"""
crud.py — Veritabanı işlemleri (Create-Read-Update-Delete + istatistik).

"Katmanlı mimari": router'lar sadece HTTP ile ilgilenir, asıl veritabanı işini bu katman yapar.
"""
import calendar
from datetime import date, datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import func, or_, select
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


# ---------------------------------------------------------------
# Tekrarlayan faturalar (Ekstra Özellik #5)
# ---------------------------------------------------------------
RECURRENCE_MONTHS = {"Aylık": 1, "3 Aylık": 3, "Yıllık": 12}
LOOKAHEAD_DAYS = 30    # bugünden bu kadar ileriye kadar olan tekrarları üret
MAX_PER_SERIES = 12    # emniyet freni: tek çalıştırmada bir seriden en fazla bu kadar ÜRET
MAX_STEPS = 240        # emniyet freni: sonsuz döngüye karşı en fazla bu kadar ay ilerle


def add_months(d: date, months: int) -> date:
    """
    Tarihe ay ekler. Ay sonu taşmasını da halleder:
    31 Ocak + 1 ay = 28 Şubat (31 Şubat diye bir gün yok!).
    Bu yüzden basitçe "ay += 1" YAZILAMAZ.
    """
    total = d.month - 1 + months
    year = d.year + total // 12
    month = total % 12 + 1
    last_day = calendar.monthrange(year, month)[1]   # o ayın kaç gün çektiği
    return date(year, month, min(d.day, last_day))


def generate_recurring(db: Session) -> list[models.Invoice]:
    """
    Tekrarlayan faturaların eksik olan tekrarlarını üretir.

    Nasıl çalışır?
      1. "Seri başı" faturaları bul (recurrence dolu, recurrence_parent_id boş)
      2. O serideki EN SON son-ödeme tarihini bul
      3. Bu tarih ufkun (bugün + 30 gün) gerisindeyse, bir sonraki tekrarı üret
      4. Ufka yetişene kadar tekrarla

    İDEMPOTENT: İkinci kez çalıştırılırsa hiçbir şey üretmez, çünkü serinin son
    tarihi artık ufkun ötesindedir. (Bu çok önemli — yoksa her tıklamada kopya çıkar.)
    """
    today = date.today()
    horizon = today + timedelta(days=LOOKAHEAD_DAYS)
    created: list[models.Invoice] = []

    heads = db.scalars(
        select(models.Invoice).where(
            models.Invoice.recurrence.is_not(None),
            models.Invoice.recurrence_parent_id.is_(None),
        )
    ).all()

    for head in heads:
        step = RECURRENCE_MONTHS.get(head.recurrence or "")
        if not step:
            continue  # tanınmayan sıklık -> atla

        # Seride (baş + çocukları) şu ana kadarki en ileri tarih
        last_due = db.scalar(
            select(func.max(models.Invoice.due_date)).where(
                or_(
                    models.Invoice.id == head.id,
                    models.Invoice.recurrence_parent_id == head.id,
                )
            )
        )

        cursor = last_due
        made = 0
        steps = 0
        while cursor <= horizon and made < MAX_PER_SERIES and steps < MAX_STEPS:
            steps += 1
            next_due = add_months(cursor, step)
            cursor = next_due
            if next_due > horizon:
                break
            # GEÇMİŞ dönemleri ATLA: hiç oluşturulmamış eski aylar için geriye dönük
            # borç yaratmayız; sadece ilerisini üretiriz. (Sayacı yine de ilerletiyoruz
            # ki doğru aya yetişelim.)
            if next_due < today:
                continue
            made += 1
            new_invoice = models.Invoice(
                # Fatura no'ya dönem ekliyoruz: "FTR-2026-111-2026-09"
                invoice_number=f"{head.invoice_number}-{next_due:%Y-%m}",
                vendor_name=head.vendor_name,
                category=head.category,
                amount=head.amount,
                currency=head.currency,
                due_date=next_due,
                status=schemas.InvoiceStatus.bekliyor.value,
                notes=head.notes,
                recurrence=head.recurrence,
                recurrence_parent_id=head.id,
                # DİKKAT: ek dosya (dekont) KOPYALANMAZ — o, o aya ait bir belgedir
            )
            db.add(new_invoice)
            created.append(new_invoice)

    db.commit()
    for inv in created:
        db.refresh(inv)
    return created


# ---------------------------------------------------------------
# Döviz kurları (Ekstra Özellik #8)
# ---------------------------------------------------------------
# Kullanıcı henüz kur girmediyse kullanılacak başlangıç değerleri.
# Arayüzde "varsayılan" olarak işaretlenir ki kimse bunları gerçek kur sanmasın.
DEFAULT_RATES: dict[str, Decimal] = {
    "TRY": Decimal("1"),
    "USD": Decimal("40.00"),
    "EUR": Decimal("43.00"),
}


def get_rates_map(db: Session) -> dict[str, Decimal]:
    """{'TRY': 1, 'USD': 40.00, ...} — veritabanındaki kurlar varsayılanların üzerine yazar."""
    rates = dict(DEFAULT_RATES)
    for row in db.scalars(select(models.ExchangeRate)).all():
        rates[row.currency] = row.rate
    rates["TRY"] = Decimal("1")  # TL'nin TL karşılığı her zaman 1
    return rates


def list_rates(db: Session) -> list[dict]:
    """Arayüzün göstereceği kur listesi (TRY hariç — onu düzenlemenin anlamı yok)."""
    kayitli = {r.currency: r for r in db.scalars(select(models.ExchangeRate)).all()}
    sonuc = []
    for currency, varsayilan in DEFAULT_RATES.items():
        if currency == "TRY":
            continue
        row = kayitli.get(currency)
        sonuc.append(
            {
                "currency": currency,
                "rate": row.rate if row else varsayilan,
                "is_default": row is None,
                "updated_at": row.updated_at if row else None,
            }
        )
    return sonuc


def upsert_rate(db: Session, currency: str, rate: Decimal) -> models.ExchangeRate:
    """Kuru kaydeder/günceller (bütçelerdeki gibi UPSERT kalıbı)."""
    row = db.scalar(select(models.ExchangeRate).where(models.ExchangeRate.currency == currency))
    if row:
        row.rate = rate
    else:
        row = models.ExchangeRate(currency=currency, rate=rate)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


def to_try(amount: Decimal, currency: str, rates: dict[str, Decimal]) -> Decimal:
    """
    Tutarı TL'ye çevirir. Kuru bilinmeyen para birimi 1 kabul edilir (veri bozulmasın).

    quantize(0.01): kur 4 ondalıklı olduğu için çarpım 4 ondalık üretiyordu
    (114950.0000). Para her zaman 2 ondalık olmalı — her faturayı ayrı ayrı
    kuruşa yuvarlayıp öyle topluyoruz (muhasebede standart yaklaşım).
    ROUND_HALF_UP = 0.005 yukarı yuvarlanır (bankacılıkta beklenen davranış).
    """
    kur = rates.get(currency, Decimal("1"))
    return ((amount or Decimal("0")) * kur).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def attach_try_amounts(db: Session, invoices: list[models.Invoice]) -> list[models.Invoice]:
    """
    Her faturaya geçici bir `amount_try` özelliği ekler (veritabanına yazılmaz).
    Pydantic `from_attributes` sayesinde bu değer cevaba dahil olur.
    """
    rates = get_rates_map(db)
    for inv in invoices:
        inv.amount_try = to_try(inv.amount, inv.currency, rates)
    return invoices


def existing_invoice_numbers(db: Session) -> set[str]:
    """Veritabanındaki tüm fatura numaraları (içe aktarmada kopya kontrolü için)."""
    return set(db.scalars(select(models.Invoice.invoice_number)).all())


def bulk_create_invoices(db: Session, items: list[models.Invoice]) -> None:
    """
    Birden çok faturayı TEK commit ile ekler.

    Neden tek commit? Her satır için ayrı commit atmak 500 satırda 500 kez
    diske yazmak demektir — çok yavaş. Toplu ekleme çok daha hızlı.
    """
    db.add_all(items)
    db.commit()


# ---------------------------------------------------------------
# Bütçeler (Ekstra Özellik #6)
# ---------------------------------------------------------------
WARNING_AT = 80   # yüzde kaçtan sonra "Uyarı" sayılsın


def upsert_budget(db: Session, category: str, data: schemas.BudgetIn) -> models.Budget:
    """
    Bütçeyi kaydeder: yoksa oluşturur, varsa günceller.
    Bu kalıba "UPSERT" denir (UPDATE + INSERT). Kullanıcı açısından
    "kaydet" tek bir işlemdir; ayrı ayrı POST/PUT uğraştırmayalım.
    """
    budget = db.scalar(select(models.Budget).where(models.Budget.category == category))
    if budget:
        budget.monthly_limit = data.monthly_limit
        budget.currency = data.currency
    else:
        budget = models.Budget(
            category=category, monthly_limit=data.monthly_limit, currency=data.currency
        )
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def get_budget(db: Session, category: str) -> models.Budget | None:
    return db.scalar(select(models.Budget).where(models.Budget.category == category))


def delete_budget(db: Session, budget: models.Budget) -> None:
    db.delete(budget)
    db.commit()


def get_budget_status(db: Session) -> list[dict]:
    """
    Her bütçe için BU AYKİ harcamayı hesaplayıp durumunu döndürür.

    "Bu ay" tanımı: son ödeme tarihi bu ay olan faturalar
    (dashboard'daki "Bu Ayın Harcaması" kartıyla AYNI kural — tutarlılık önemli).
    """
    today = date.today()
    budgets = list(db.scalars(select(models.Budget).order_by(models.Budget.category)).all())
    if not budgets:
        return []

    # Bu ayın harcamasını kategoriye göre topla.
    # NOT: Artık SQL'de GROUP BY ile toplamıyoruz; çünkü farklı para birimlerini
    # önce TL'ye çevirmemiz gerekiyor (kurlar Python tarafında). Bu yüzden bu ayın
    # faturalarını çekip Python'da topluyoruz — ay bazında az kayıt olduğu için sorun değil.
    rates = get_rates_map(db)
    ay_faturalari = db.scalars(
        select(models.Invoice).where(
            func.extract("year", models.Invoice.due_date) == today.year,
            func.extract("month", models.Invoice.due_date) == today.month,
        )
    ).all()
    spent_by_cat: dict[str, Decimal] = {}
    for inv in ay_faturalari:
        spent_by_cat[inv.category] = spent_by_cat.get(inv.category, Decimal("0")) + to_try(
            inv.amount, inv.currency, rates
        )

    result = []
    for b in budgets:
        spent = spent_by_cat.get(b.category, Decimal("0"))
        percent = int(spent / b.monthly_limit * 100) if b.monthly_limit else 0
        if percent > 100:
            state = schemas.BudgetState.over
        elif percent >= WARNING_AT:
            state = schemas.BudgetState.warning
        else:
            state = schemas.BudgetState.ok
        result.append(
            {
                "category": b.category,
                "monthly_limit": b.monthly_limit,
                "currency": b.currency,
                "spent": spent,
                "remaining": b.monthly_limit - spent,
                "percent": percent,
                "state": state,
            }
        )
    return result


def get_stats(db: Session) -> dict:
    """
    Dashboard için özet hesaplar (3 KPI + kategori dağılımı + 6 aylık trend).

    TÜM tutarlar TL'ye çevrilerek toplanır. (Ekstra #8 öncesinde USD faturalar
    TL'ymiş gibi toplanıyordu — 210 USD, 210 TL sayılıyordu. Artık düzeltildi.)
    """
    invoices = list(db.scalars(select(models.Invoice)).all())
    rates = get_rates_map(db)
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
        # Artık ham tutar değil, TL karşılığı toplanıyor
        amt = to_try(inv.amount, inv.currency, rates)

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
                    # DİKKAT: burada TL'ye çevrilmiş "amt" DEĞİL, faturanın KENDİ tutarı
                    # kullanılıyor — yanında kendi para birimi yazacağı için
                    # ("210 USD" olmalı, "8.400 USD" değil).
                    {"id": inv.id, "vendor_name": inv.vendor_name,
                     "amount": inv.amount or Decimal("0"), "currency": inv.currency}
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
