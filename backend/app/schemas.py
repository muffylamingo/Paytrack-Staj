"""
schemas.py — Pydantic şemaları (API'nin girdi/çıktı "sözleşmeleri").

models.py tabloların kendisiydi (veritabanı).
schemas.py ise API'ye GİREN ve API'den ÇIKAN verinin şeklidir (doğrulama).
Neden ayrı? Çünkü dışarıdan gelen veriyle (kullanıcı) veritabanındaki veri (id, tarih...) farklıdır.
"""
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


# İzin verilen değerler (yanlış değer gelirse FastAPI otomatik 422 hatası döner)
class Category(str, Enum):
    enerji = "Enerji"
    yazilim = "Yazılım"
    kira = "Kira"
    mutfak = "Mutfak"


class InvoiceStatus(str, Enum):
    bekliyor = "Bekliyor"
    odendi = "Ödendi"
    gecikti = "Gecikti"


class Recurrence(str, Enum):
    """Tekrarlama sıklığı (boş = tekrarlamayan tek seferlik fatura)."""
    aylik = "Aylık"
    uc_aylik = "3 Aylık"
    yillik = "Yıllık"


# Ortak alanlar (hem oluştururken hem dönerken lazım olanlar)
class InvoiceBase(BaseModel):
    invoice_number: str = Field(min_length=1, max_length=50, description="Fatura No")
    vendor_name: str = Field(min_length=1, max_length=120, description="Tedarikçi adı")
    category: Category
    amount: Decimal = Field(gt=0, description="Tutar (0'dan büyük olmalı)")
    currency: str = Field(default="TRY", max_length=3)
    due_date: date = Field(description="Son ödeme tarihi (YYYY-MM-DD)")
    notes: str | None = Field(default=None, max_length=500)
    recurrence: Recurrence | None = Field(
        default=None, description="Tekrarlama sıklığı (boş = tek seferlik)"
    )


# POST /invoices gövdesi — yeni fatura eklerken kullanıcının gönderdiği veri
class InvoiceCreate(InvoiceBase):
    status: InvoiceStatus = InvoiceStatus.bekliyor  # belirtilmezse "Bekliyor"


# PUT /invoices/{id} gövdesi — güncelleme (sadece değiştirmek istediğin alanları gönder)
class InvoiceUpdate(BaseModel):
    invoice_number: str | None = Field(default=None, max_length=50)
    vendor_name: str | None = Field(default=None, max_length=120)
    category: Category | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, max_length=3)
    due_date: date | None = None
    status: InvoiceStatus | None = None
    notes: str | None = Field(default=None, max_length=500)
    recurrence: Recurrence | None = None


# API'nin DÖNDÜRDÜĞÜ fatura — veritabanından okunur (id, tarihler dahil)
class InvoiceOut(InvoiceBase):
    # from_attributes: SQLAlchemy nesnesini (satırı) doğrudan bu şemaya çevirebilmek için
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: InvoiceStatus
    created_at: datetime
    paid_at: datetime | None = None
    user_id: int | None = None
    # Ek dosyanın sadece ADINI dışarı veriyoruz; diskteki gerçek yolu (attachment_path)
    # bilerek gizliyoruz — dış dünyanın sunucu klasör yapısını bilmesine gerek yok.
    attachment_name: str | None = None
    # Doluysa: bu fatura sistemin ürettiği bir tekrar (arayüzde "otomatik" rozeti için)
    recurrence_parent_id: int | None = None


# POST /invoices/generate-recurring cevabı
class GenerateResult(BaseModel):
    created: int                      # kaç yeni fatura üretildi
    invoices: list["InvoiceOut"]      # üretilenlerin kendisi


# --- Dashboard / İstatistik şemaları (Faz 5) ---
class CategoryStat(BaseModel):
    category: str
    total: Decimal


class MonthlyStat(BaseModel):
    month: str      # "2026-07"
    total: Decimal


class DueTodayItem(BaseModel):
    id: int
    vendor_name: str
    amount: Decimal
    currency: str


class Stats(BaseModel):
    total_overdue: Decimal        # Toplam gecikmiş borç
    due_next_7_days: Decimal      # Gelecek 7 günlük ödeme yükü
    this_month_total: Decimal     # Bu ayın toplamı (son ödeme bu ay olanlar)
    unpaid_count: int             # Ödenmemiş fatura sayısı
    overdue_count: int            # Gecikmiş fatura sayısı
    due_today: list[DueTodayItem]     # bugün son ödeme günü olan faturalar (hatırlatıcı)
    by_category: list[CategoryStat]   # pasta grafik için
    monthly_trend: list[MonthlyStat]  # çizgi grafik için (son 6 ay)
