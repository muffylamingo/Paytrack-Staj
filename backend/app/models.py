"""
models.py — Veritabanı tabloları (PDF 1. Aşama şemasına birebir).

Her sınıf = bir tablo. Her "mapped_column" = bir sütun.
PDF şeması:
  users    : id, username, email, password_hash
  invoices : id, invoice_number, vendor_name, category, amount, currency,
             due_date, status  (+ pratikte lazım olan notes, tarihler, user_id)
"""
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# İzin verilen değerler (Faz 2'de API doğrulamasında da kullanacağız):
#   category : "Enerji" | "Yazılım" | "Kira" | "Mutfak"
#   status   : "Bekliyor" | "Ödendi" | "Gecikti"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Bir kullanıcının birçok faturası olabilir (1 - N ilişki)
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="user")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_number: Mapped[str] = mapped_column(String(50), index=True)   # Fatura No
    vendor_name: Mapped[str] = mapped_column(String(120), index=True)     # Tedarikçi adı
    category: Mapped[str] = mapped_column(String(30))                     # Kategori
    # Para için Numeric/Decimal kullanırız; "float" yuvarlama hatası yapar, parada tehlikeli!
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))               # Tutar
    currency: Mapped[str] = mapped_column(String(3), default="TRY")       # Döviz (TRY/USD/EUR)
    due_date: Mapped[date] = mapped_column(Date, index=True)              # Son ödeme tarihi
    status: Mapped[str] = mapped_column(String(20), default="Bekliyor")   # Durum
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True) # Açıklama (opsiyonel)

    # --- Ek dosya (dekont/fatura PDF'i veya görseli) ---
    # DİKKAT: Dosyanın KENDİSİNİ veritabanına koymuyoruz! Diske yazıyoruz,
    # veritabanında sadece "nerede olduğu" ve "orijinal adı" duruyor.
    # (Veritabanı dosya deposu değildir: yedek boyutunu şişirir, sorguları yavaşlatır.)
    attachment_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # kullanıcının yüklediği orijinal dosya adı ("dekont.pdf")
    attachment_path: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # diskteki benzersiz ad ("a3f9...c1.pdf") — uploads/ klasöründe

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )  # Ödendiğinde dolar

    # Faturayı giren kullanıcı (şimdilik opsiyonel; giriş sistemi Faz 7'de gelecek)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    user: Mapped["User | None"] = relationship(back_populates="invoices")
