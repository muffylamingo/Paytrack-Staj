# 📊 PayTrack — İlerleme Panosu

> **Nerede kaldık?** Tek bakışta özet.
> Detaylı plan → [PLAN.md](PLAN.md) · Çalışılacak konular → [CALISMA-NOTLARI.md](CALISMA-NOTLARI.md) · Komutlar → [KOMUTLAR.md](KOMUTLAR.md)
> Son güncelleme: **2026-07-30**

**Genel ilerleme:** `▓▓▓▓▓▓▓░░` &nbsp; **7 / 9 faz tamam (~%78)**

| Faz | Konu | Durum | Ne yaptık / yapacağız |
|:--:|------|:-----:|------|
| 0 | Hazırlık & Kurulum | ✅ **Bitti** | Araç kontrolü; `docker-compose.yml`; PostgreSQL container |
| 1 | Veritabanı Şeması | ✅ **Bitti** | SQLAlchemy modelleri; Alembic migration |
| 2 | Backend CRUD | ✅ **Bitti** | FastAPI CRUD + filtreler |
| 3 | Frontend Ekranlar | ✅ **Bitti** | Organic tema; menü + üst bar; Faturalar ekranı |
| 4 | Sorgu / Filtre / Sıralama | ✅ **Bitti** | Tıklanabilir başlıklarla sıralama + filtreler |
| 5 | Dashboard & Raporlama | ✅ **Bitti** | KPI kartları + grafikler (Recharts) + Excel export |
| 6 | 🏆 Otomatik Hatırlatıcı | ✅ **Bitti** | "Bugün son ödeme günü" uyarı bandı (her sayfada) |
| 7 | 🏆 Keycloak Giriş | ⏳ **Sıradaki** | Kullanıcı doğrulama sistemi (en zor) |
| 8 | Cila & Sunum | ⬜ Bekliyor | 11 ekstra özellik (dark mode, tekrarlayan fatura...), README, demo |

**Şu anki konum:** Faz 6 ✅ bitti — çekirdek + hatırlatıcı hazır! → Sırada Faz 7 (Keycloak) veya Faz 8 (ekstralar).

---
**Durum işaretleri:** ✅ Bitti · ⏳ Üstünde çalışıyoruz · ⬜ Sırada bekliyor · 🏆 Challenge (ekstra görev)
