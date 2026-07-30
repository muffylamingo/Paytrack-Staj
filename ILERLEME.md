# 📊 PayTrack — İlerleme Panosu

> **Nerede kaldık?** Tek bakışta özet.
> Detaylı plan → [PLAN.md](PLAN.md) · Çalışılacak konular → [CALISMA-NOTLARI.md](CALISMA-NOTLARI.md) · Komutlar → [KOMUTLAR.md](KOMUTLAR.md)
> Son güncelleme: **2026-07-31**

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
| 8 | Cila & Sunum (Ekstralar) | ⏳ **Devam ediyor** | 11 ekstra özellik (aşağıdaki tablo), README, demo |

**Şu anki konum:** Faz 8 başladı 🌙 — Karanlık Mod bitti. Faz 7 (Keycloak) en sona bırakıldı.

---

## ⭐ Faz 8 — Ekstra Özellikler (11 adet)

`▓▓▓░░░░░░░` &nbsp; **3 / 11 tamam (~%27)**

| # | Özellik | Zorluk | Durum |
|:--:|---------|:------:|:-----:|
| 1 | 🌙 Karanlık Mod | 🟢 Kolay | ✅ **Bitti** |
| 2 | KPI Trend Okları | 🟢 Kolay | ✅ **Bitti** |
| 3 | 🔔 Toast Bildirimleri | 🟢 Kolay | ✅ **Bitti** |
| 4 | Fatura Dosyası Ekleme | 🟡 Orta | ⏳ Sıradaki |
| 5 | Tekrarlayan Faturalar | 🟡 Orta | ⬜ |
| 6 | Bütçe Uyarısı | 🟡 Orta | ⬜ |
| 7 | Excel'den İçe Aktarma | 🟡 Orta | ⬜ |
| 8 | Çoklu Para Birimi + Kur | 🟡 Orta | ⬜ |
| 9 | Çoklu Dil (TR/EN) | 🟡 Orta | ⬜ |
| 10 | İşlem Geçmişi (Audit Log) | 🟠 Zor | ⬜ |
| 11 | Ödeme Takvimi Görünümü | 🟠 Zor | ⬜ |

---
**Durum işaretleri:** ✅ Bitti · ⏳ Üstünde çalışıyoruz · ⬜ Sırada bekliyor · 🏆 Challenge (ekstra görev)
