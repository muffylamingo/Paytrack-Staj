"""
storage.py — Yüklenen dosyaların diskte saklanması.

Neden ayrı bir dosya? "Tek sorumluluk": router HTTP ile, crud veritabanıyla,
burası da DİSK ile ilgilenir. Böylece yarın dosyaları buluta (S3) taşımak
istersek sadece bu dosyayı değiştiririz.

GÜVENLİK — bir dosya yükleme endpoint'i internetin en çok saldırı alan yeridir:
  1. Uzantı/tür beyaz listesi  -> .exe, .php gibi çalıştırılabilir dosya kabul etmeyiz
  2. Boyut sınırı              -> disk doldurma saldırısını engeller
  3. Adı BİZ üretiriz (uuid)   -> kullanıcının gönderdiği ad asla yol olarak kullanılmaz
     (yoksa "../../.env" gibi bir adla sunucudaki başka dosyaların üzerine yazılabilir
      = "path traversal" açığı)
"""
import uuid
from pathlib import Path

from app.config import BACKEND_DIR

# Dosyaların yazılacağı klasör: backend/uploads/  (.gitignore'da — git'e girmez)
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_BYTES = 5 * 1024 * 1024  # 5 MB

# İzin verilen tipler: {MIME tipi: uzantı}
ALLOWED = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class UploadError(Exception):
    """Yükleme kuralları ihlal edilince fırlatılır; router bunu 400'e çevirir."""


def save_upload(content: bytes, content_type: str | None) -> str:
    """Dosyayı diske yazar ve DİSKTEKİ benzersiz adı döndürür."""
    if content_type not in ALLOWED:
        raise UploadError("Sadece PDF, JPG, PNG veya WEBP yüklenebilir.")
    if len(content) > MAX_BYTES:
        raise UploadError("Dosya çok büyük (en fazla 5 MB).")
    if not content:
        raise UploadError("Dosya boş.")

    # Adı biz üretiyoruz -> kullanıcının gönderdiği ad diske hiç dokunmuyor
    stored_name = f"{uuid.uuid4().hex}{ALLOWED[content_type]}"
    (UPLOAD_DIR / stored_name).write_bytes(content)
    return stored_name


def file_path(stored_name: str) -> Path:
    """Diskteki tam yolu verir."""
    return UPLOAD_DIR / stored_name


def delete_file(stored_name: str | None) -> None:
    """Dosyayı siler. Yoksa sessizce geçer (missing_ok)."""
    if stored_name:
        file_path(stored_name).unlink(missing_ok=True)
