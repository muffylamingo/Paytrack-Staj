# 💼 PayTrack — Kurumsal Fatura Yönetim Sistemi
### ODAKENT Stajyer Öğrenci Programı — Proje Ödevi 1 · Master Plan

> **Amaç:** Bir şirketin gelen faturalarını kaydeden, ödeme durumlarını takip eden ve aylık
> harcamalarını raporlayan bir web uygulaması geliştirmek.
>
> **Bu dosya nedir?** Projenin pusulası. Ne yapacağımızı, hangi teknolojiyi neden seçtiğimizi,
> hangi sırayla ilerleyeceğimizi ve senin neler öğreneceğini içerir. Kafan karışınca buraya dön.

---

## 📑 İçindekiler
1. [Genel Bakış](#1-genel-bakış)
2. [Tech Stack ve Kararlar (neden bunlar?)](#2-tech-stack-ve-kararlar)
3. [Öğrenmen Gereken Diller & Kütüphaneler](#3-öğrenmen-gereken-diller--kütüphaneler)
4. [⭐ Ekstra "Etkileyici" Özellikler Tablosu](#4--ekstra-etkileyici-özellikler-tablosu)
5. [Klasör Yapısı](#5-klasör-yapısı)
6. [🗺️ Roadmap (Faz Faz)](#6-️-roadmap-faz-faz)
7. [Veritabanı Şeması](#7-veritabanı-şeması)
8. [API Endpoint Listesi](#8-api-endpoint-listesi)
9. [Frontend Ekranları](#9-frontend-ekranları)
10. [🎨 Stitch Tasarım Prompt'u](#10--stitch-tasarım-promptu)
11. [Sıradaki Adım](#11-sıradaki-adım)

---

## 1. Genel Bakış

PayTrack, muhasebe/finans ekibinin işini kolaylaştıran bir "iç araç" (internal tool). Temel iş akışı:

1. Bir fatura gelir (örn. EnerjiSA elektrik faturası, 4.200 TL, son ödeme 5 Ağustos).
2. Kullanıcı bu faturayı sisteme girer.
3. Sistem faturayı listeler; son ödeme tarihi yaklaşanları **kırmızı** ile uyarır.
4. Fatura ödenince "Ödendi" olarak işaretlenir.
5. Dashboard, yöneticiye özet gösterir: toplam borç, bu ayki harcama, kategori dağılımı vb.

Bu proje bilerek **harita/karmaşık kütüphane** içermiyor; odak noktası **iş mantığı** (business logic),
**CRUD**, **filtreleme** ve **raporlama**. Yani bir backend geliştiricinin günlük işine en yakın proje türü.

---

## 2. Tech Stack ve Kararlar

| Katman | Teknoloji | Neden? |
|--------|-----------|--------|
| **Frontend** | React (Vite) + Tailwind CSS | PDF'te belirtildi. Vite = çok hızlı geliştirme sunucusu. Tailwind = CSS yazmadan hızlı, modern arayüz. |
| **Backend** | Python + **FastAPI** | PDF'te önerildi. Modern, hızlı, otomatik `/docs` (Swagger) arayüzü üretir — API'ni tarayıcıdan test edersin. |
| **ORM** | **SQLAlchemy 2.0** + Alembic | 👇 Kararı aşağıda açıkladım. |
| **Veritabanı** | PostgreSQL (Docker ile) | PDF'te belirtildi. Docker = "kur, çalıştır, sil" — bilgisayarını kirletmez. |
| **Doğrulama** | Pydantic v2 | FastAPI'nin içinde gelir. Gelen/giden verinin doğru tipte olmasını garanti eder. |
| **Grafik** | **Recharts** | PDF'te Chart.js veya Recharts deniyor. React'le en doğal çalışan Recharts; JSX ile grafik yazarsın. |
| **Excel Export** | pandas + openpyxl | PDF'te önerildi. Fatura listesini `.xlsx` olarak indirmek için. |
| **Auth (Challenge)** | Keycloak (Docker) | PDF'teki challenge görevi. En sona bıraktık çünkü en zor kısım. |

### 🧠 ORM kararı: neden SQLAlchemy?
"Sen karar ver" dedin, işte gerekçem:

- **En yaygın olan bu.** İş ilanlarının çoğunda "SQLAlchemy" geçer → **CV'nde değerli**.
- **En çok kaynak bunda.** Yeni başlayan biri çok Google'layacak; SQLAlchemy'de her sorunun cevabı hazır.
- **FastAPI ile mükemmel çalışır** ve SQLAlchemy 2.0'ın yeni tip-güvenli (typed) söz dizimi modern.
- **Alembic** ile birlikte gelir → veritabanı değişikliklerini "migration" ile yönetiriz (profesyonel yöntem).

> **Not:** Alternatif olarak SQLModel (FastAPI'nin yaratıcısının yaptığı, daha az kod yazdıran kütüphane)
> vardı. Daha kolay ama daha az yaygın. Öğrenmen gereken **piyasa becerisi** SQLAlchemy olduğu için onu seçtim.
> İlerde çok zorlarsak SQLModel'e geçebiliriz — söz dizimi çok benzer.

---

## 3. Öğrenmen Gereken Diller & Kütüphaneler

Panik yok — hepsini yol boyunca **ihtiyaç oldukça** öğreneceğiz. Bu sadece "büyük resim".

### Diller
| Dil | Nerede? | Öncelik |
|-----|---------|---------|
| **Python** | Backend (FastAPI, iş mantığı) | ⭐⭐⭐ Yüksek |
| **JavaScript (+ JSX)** | Frontend (React) | ⭐⭐⭐ Yüksek |
| **SQL** | Veritabanı sorguları (ORM çoğunu senin yerine yazar ama mantığı bilmelisin) | ⭐⭐ Orta |
| **HTML + CSS** | Tailwind zaten CSS ama temel HTML mantığı lazım | ⭐⭐ Orta |

### Backend kütüphaneleri (Python)
| Kütüphane | Ne işe yarar? |
|-----------|---------------|
| `fastapi` | Web API'sini (endpoint'leri) oluşturur |
| `uvicorn` | FastAPI'yi çalıştıran sunucu |
| `sqlalchemy` | Veritabanı tablolarını Python sınıfı olarak yazmanı sağlar (ORM) |
| `alembic` | Veritabanı şema değişikliklerini yönetir (migration) |
| `psycopg2-binary` | Python'un PostgreSQL ile konuşmasını sağlayan sürücü |
| `pydantic` | Gelen/giden JSON verisini doğrular (FastAPI ile gelir) |
| `pandas` + `openpyxl` | Fatura listesini Excel'e aktarır |
| `python-jose` / `passlib` | JWT token + şifre hash'leme (Keycloak yerine basit auth istersek) |

### Frontend kütüphaneleri (JavaScript)
| Kütüphane | Ne işe yarar? |
|-----------|---------------|
| `react` + `react-dom` | Arayüzün temeli |
| `vite` | Geliştirme sunucusu + build aracı |
| `tailwindcss` | Hızlı stil verme |
| `axios` | Backend API'sine istek atmak |
| `react-router-dom` | Sayfalar arası geçiş (Dashboard ↔ Liste) |
| `recharts` | Pasta & çizgi grafikleri |
| `react-hook-form` | Fatura giriş formunu kolay yönetmek |
| `date-fns` | Tarih işlemleri (son ödeme yaklaşıyor mu? vb.) |

### Araçlar
`Docker Desktop` (PostgreSQL için) · `Node.js` (React için) · `Python 3.11+` · `VS Code` · `Git` · `Postman` veya FastAPI `/docs` (API testi)

---

## 4. ⭐ Ekstra "Etkileyici" Özellikler Tablosu

PDF'in istediği çekirdek özelliklerin **üstüne**, seni öne çıkaracak fikirler. Hepsini yapmak zorunda
değiliz — bunlar bir **menü**. Roadmap'in sonunda birlikte seçeceğiz. "Etki" = amirini etkileme gücü,
"Zorluk" = senin için ne kadar uğraştırır.

| # | Özellik | Ne İşe Yarar? | Etki | Zorluk | Öneri |
|---|---------|---------------|:----:|:------:|-------|
| 1 | **Karanlık Mod (Dark Mode)** | Tek tıkla açık/koyu tema. Tailwind ile çok kolay, çok "pro" görünür. | ⭐⭐⭐ | 🟢 Kolay | ✅ **YAPILDI** |
| 2 | **KPI Trend Okları** | Özet kartlarında "geçen aya göre %12 ↑" gibi yön okları. | ⭐⭐⭐ | 🟢 Kolay | ✅ **YAPILDI** |
| 3 | **Toast Bildirimleri** | "Fatura kaydedildi ✓" gibi şık anlık uyarılar. | ⭐⭐ | 🟢 Kolay | ✅ **YAPILDI** |
| 4 | **Fatura Dosyası Ekleme** | Her faturaya PDF/görsel yükleme (dekont saklama). | ⭐⭐⭐ | 🟡 Orta | ✅ **YAPILDI** |
| 5 | **Tekrarlayan Faturalar** | Kira/abonelik gibi her ay otomatik oluşan faturalar. **Çok "iş mantığı" gösterir.** | ⭐⭐⭐⭐ | 🟡 Orta | ✅ **YAPILDI** |
| 6 | **Bütçe Uyarısı** | Kategoriye aylık bütçe koy, aşılınca uyar (örn. "Yazılım bütçesi doldu"). | ⭐⭐⭐ | 🟡 Orta | ✅ **YAPILDI** |
| 7 | **Excel'den İçe Aktarma** | Export'un tersi: Excel dosyasından toplu fatura yükleme. | ⭐⭐⭐ | 🟡 Orta | ✅ **YAPILDI** |
| 8 | **Çoklu Para Birimi + Kur** | USD/EUR faturaları TL karşılığıyla göster (sabit veya canlı kur). | ⭐⭐⭐ | 🟡 Orta | ✅ **YAPILDI** |
| 9 | **İşlem Geçmişi (Audit Log)** | "Kim, ne zaman, neyi değiştirdi" kaydı. Kurumsal ciddiyet katar. | ⭐⭐⭐ | 🟠 Zor | Opsiyonel |
| 10 | **Ödeme Takvimi Görünümü** | Faturaları takvim üzerinde göster (hangi gün ne ödenecek). | ⭐⭐ | 🟠 Zor | Opsiyonel |
| 11 | **Çoklu Dil (TR/EN)** | Arayüzü İngilizce/Türkçe değiştirme. | ⭐⭐ | 🟡 Orta | ✅ **YAPILDI** |

> **KARAR (2026-07-27):** Kullanıcı **hepsini** istedi. ✅ Hepsi plana dahil. Ama toplu değil,
> **kolaydan zora serpiştirerek** yapacağız: kolaylar (1,2,3) arayüzü kurarken; orta seviye (4,5,6,7,8,11)
> ilgili fazlarda; zorlar (9 audit log, 10 takvim) en sona. Boğulmamak için sıra bu.

---

## 5. Klasör Yapısı

```
stajprje/
├── PLAN.md                  ← bu dosya
├── docker-compose.yml       ← PostgreSQL (+ ilerde Keycloak) tek komutla ayağa kalkar
│
├── backend/                 ← Python / FastAPI
│   ├── app/
│   │   ├── main.py          ← uygulamanın giriş noktası
│   │   ├── database.py      ← veritabanı bağlantısı
│   │   ├── models.py        ← SQLAlchemy tabloları (Invoice, User)
│   │   ├── schemas.py       ← Pydantic şemaları (API'nin girdi/çıktısı)
│   │   ├── crud.py          ← veritabanı işlemleri (ekle, listele, güncelle)
│   │   └── routers/
│   │       ├── invoices.py  ← /invoices endpoint'leri
│   │       └── stats.py     ← /stats endpoint'leri
│   ├── alembic/             ← veritabanı migration'ları
│   └── requirements.txt     ← Python kütüphane listesi
│
└── frontend/                ← React / Vite
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/             ← axios ile backend'e istekler
    │   ├── components/      ← tekrar kullanılan parçalar (kart, tablo, form)
    │   └── pages/           ← Dashboard, InvoiceList, ...
    ├── index.html
    └── package.json         ← JS kütüphane listesi
```

---

## 6. 🗺️ Roadmap (Faz Faz)

> Kural: **Bir fazı bitirmeden diğerine geçmeyiz.** Her fazın sonunda çalışan bir şey olacak ki
> ilerlediğini görebilesin. Süreler tahmini; acele yok, öğrenmek önce gelir.

### Faz 0 — Hazırlık & Kurulum · ~1 gün  ✅ (büyük kısmı tamam)
- [x] Node.js, Python, Docker Desktop, Git kurulumu — **hepsi zaten kuruluydu** ✓
- [ ] Klasör yapısını oluştur (backend/ frontend/ — Faz 1-3'te doldurulacak)
- [x] `docker-compose.yml` ile PostgreSQL'i ayağa kaldır ve bağlan ✓ (`paytrack_db` çalışıyor)
- **Öğrenilecek:** terminal temelleri, Docker mantığı, venv

### Faz 1 — Veritabanı Şeması · ~1-2 gün *(PDF 1. Aşama)*  ✅ Bitti
- [x] Backend sanal ortamı (`.venv`) + kütüphaneler kuruldu — Python 3.14 uyumlu ✓
- [x] SQLAlchemy ile `User` ve `Invoice` modellerini yaz ✓
- [x] Alembic ile ilk migration'ı oluştur, tabloları veritabanına bas ✓ (`users`, `invoices` oluştu)
- [ ] Elle birkaç örnek fatura ekle (test verisi) → *Faz 2'de API ile ekleyeceğiz*
- **Öğrenilecek:** ORM mantığı, tablo/kolon/ilişki, migration

### Faz 2 — Backend CRUD · ~2-3 gün *(PDF 2. Aşama)*  ✅ Bitti
- [x] `POST /invoices` — yeni fatura ✓
- [x] `GET /invoices` — listeleme + `?status=` `?category=` `?vendor=` filtreleri ✓
- [x] `GET /invoices/{id}` · `PUT /invoices/{id}` · `DELETE /invoices/{id}` ✓
- [x] `PATCH /invoices/{id}/pay` — "Ödendi" işaretle ✓
- [x] FastAPI `/docs` üzerinden test edildi ✓ (ilk örnek fatura: EnerjiSA, id=1)
- **Öğrenilecek:** REST, HTTP metodları, endpoint yazımı, Pydantic
- *Not: `GET /stats` dashboard için Faz 5'te; sıralama Faz 4'te.*

### Faz 3 — Frontend Temel Ekranlar · ~3-4 gün *(PDF 3. Aşama)*  ✅ Bitti (Organic tema)
- [x] Vite + React + Tailwind (v4) kurulumu ✓
- [x] Organic (krem/kil) renk teması + Fraunces/Inter fontları + canlı backend bağlantısı ✓
- [x] Genel layout (sol menü + üst bar) — React Router ✓
- [x] Fatura Giriş Formu (Select + Datepicker, sağdan açılan modal) ✓
- [x] Ana Liste (tablo, durum rozetleri, son ödeme yaklaşan = kırmızı, "Öde" butonu) ✓
- [x] Arama Çubuğu (tedarikçi) + durum/kategori filtreleri ✓
- **Öğrenilecek:** React component, state, form, axios ile API çağrısı, React Router

### Faz 4 — Sorgu / Filtre / Sıralama · ~2 gün *(PDF 4. Aşama)*  ✅ Bitti
- [x] Gelişmiş sorgu (birleşik filtreler: durum + kategori + tedarikçi birlikte) ✓
- [x] Tutar/tarihe göre artan-azalan sıralama (tıklanabilir başlıklar + backend `sort/order`) ✓
- **Öğrenilecek:** query parametreleri, frontend-backend filtre uyumu

### Faz 5 — Dashboard & Raporlama · ~3 gün *(PDF 5. Aşama)*  ✅ Bitti
- [x] `GET /stats` — özet veriler ✓
- [x] 3 Özet Kartı: Toplam Gecikmiş Borç · Gelecek 7 Gün Yükü · Bu Ay Harcaması ✓
- [x] Pasta grafiği (kategori dağılımı) — Recharts ✓
- [x] Çizgi grafik (son 6 ay trendi) — Recharts ✓
- [x] Excel (XLSX) dışa aktarma butonu (openpyxl) ✓ — mevcut filtreyle indirir
- **Öğrenilecek:** veri toplama (aggregation), grafik kütüphanesi, dosya indirme
- *Not: dashboard'u canlı göstermek için `backend/seed.py` ile 12 örnek fatura eklendi.*

### Faz 6 — 🏆 Challenge: Otomatik Hatırlatıcı · ~1 gün  ✅ Bitti
- [x] Son ödeme tarihi **bugün** olan faturalar için ekranda "Bildirim/Alert" göster ✓ (`ReminderBanner`)
- **Öğrenilecek:** tarih karşılaştırma, koşullu UI

### Faz 7 — 🏆 Challenge: Keycloak ile Giriş · ~3-4 gün *(en zor kısım)*
- [ ] Keycloak'ı Docker ile ayağa kaldır
- [ ] Sadece giriş yapan kullanıcı sisteme girebilsin
- **Öğrenilecek:** OAuth2/OIDC, token, korumalı endpoint
- **Not:** Zorlanırsak önce basit JWT login yapıp Keycloak'ı en sona bırakırız.

### Faz 8 — Cila & Sunum · ~1-2 gün
- [ ] Seçtiğimiz ekstra özellikler (tablodan)
- [ ] Dark mode, toast, KPI okları
- [ ] README + ekran görüntüleri + demo hazırlığı
- **Öğrenilecek:** projeyi sunma, dokümantasyon

**Kabaca toplam:** ~3-4 hafta (öğrenerek ilerlediğimiz için). Çekirdek (Faz 0-5) biterse proje zaten "tam" sayılır; 6-8 bonus.

---

## 7. Veritabanı Şeması

### `users`
| Kolon | Tip | Not |
|-------|-----|-----|
| id | int (PK) | Otomatik artan |
| username | string | Benzersiz |
| email | string | Benzersiz |
| password_hash | string | Şifre asla düz metin tutulmaz |
| created_at | datetime | |

### `invoices`
| Kolon | Tip | Not |
|-------|-----|-----|
| id | int (PK) | |
| invoice_number | string | Fatura No |
| vendor_name | string | Tedarikçi (EnerjiSA, AWS, Kira...) |
| category | enum | Enerji · Yazılım · Kira · Mutfak |
| amount | decimal | Tutar |
| currency | string | TRY · USD · EUR |
| due_date | date | Son ödeme tarihi |
| status | enum | Bekliyor · Ödendi · Gecikti |
| notes | text | Opsiyonel açıklama |
| created_at | datetime | |
| paid_at | datetime | Ödendiğinde dolar |
| user_id | int (FK) | Faturayı giren kullanıcı |

> `status` mantığı: kullanıcı girer → **Bekliyor**. Ödenince → **Ödendi**. `due_date` geçmiş ve hâlâ
> ödenmemişse → **Gecikti** (backend otomatik hesaplayabilir).

---

## 8. API Endpoint Listesi

| Metod | Yol | Açıklama | Faz |
|-------|-----|----------|-----|
| POST | `/invoices` | Yeni fatura girişi | 2 |
| GET | `/invoices` | Listele (`?status=` `?category=` `?vendor=` `?sort=` `?order=`) | 2/4 |
| GET | `/invoices/{id}` | Tek fatura detayı | 2 |
| PUT | `/invoices/{id}` | Fatura düzenle | 2 |
| DELETE | `/invoices/{id}` | Fatura sil | 2 |
| PATCH | `/invoices/{id}/pay` | "Ödendi" işaretle | 2 |
| GET | `/stats` | Dashboard özet verileri | 5 |
| GET | `/stats/trend` | Son 6 ay ödeme trendi | 5 |
| GET | `/invoices/export` | Excel (XLSX) indir | 5 |
| POST | `/auth/register` | Kayıt (basit auth senaryosu) | 7 |
| POST | `/auth/login` | Giriş (JWT/Keycloak) | 7 |
| GET | `/auth/me` | Giriş yapan kullanıcı | 7 |

---

## 9. Frontend Ekranları

1. **Giriş (Login)** — kullanıcı adı/şifre (Faz 7'de aktifleşir)
2. **Dashboard** — 3 KPI kartı + pasta grafik + çizgi grafik + "bugün ödenecek" uyarısı
3. **Fatura Listesi** — arama, filtre, sıralama, durum rozetleri, yaklaşan = kırmızı satır
4. **Fatura Formu** — kategori Select'i + Datepicker'lı, modal/yan panel şeklinde
5. **(Bonus) Ayarlar** — dark mode, bütçe tanımlama vb.

---

## 10. 🎨 Tasarım Kararı — "Purple React" görünümü

> **KARAR (2026-07-27):** Stitch yerine kullanıcı hazır bir tema beğendi: **"Purple React"**
> (BootstrapDash ücretsiz admin dashboard). Mor tema, sol menü, 3 gradyan KPI kartı, bar + donut grafik.
>
> Bu tema 2019 yapımı (eski CRA + Bootstrap + node-sass) olduğu için **dosyalarını kullanmıyoruz** —
> **görünümünü** temiz **Vite + React + Tailwind** projesinde yeniden kuruyoruz. Grafikler **Recharts** ile.
> Yani template = **tasarım şablonu**. Orijinal zip: `C:\Users\hp\Downloads\purple-react-1.0.0.zip`.
>
> *(Stitch prompt'ları yine `stitch-prompt.md` dosyasında duruyor — ileride bir ekranı sıfırdan
> tasarlamak istersek yedek olarak kullanılabilir.)*
>
> **GÜNCELLEME (2026-07-28):** Kullanıcı, Purple'ın **mor rengi yerine** krem/toprak tonlu bir
> **"Organic"** palet istedi (Claude Organic tarzı: krem arka plan, kil/terracotta vurgu `#C2703F`,
> sıcak kahve tonları, **Fraunces** serif başlıklar). **Düzen aynı** (sol menü + kartlar), **renk organik.**
> Palet `frontend/src/index.css` içindeki `@theme` bloğunda tanımlı.

---

## 11. Sıradaki Adım

1. ✅ Bu planı oku, aklına takılan olursa sor.
2. 🎨 Stitch'e prompt'u yapıştır, 2-3 tasarım fikri üret, bana ekran görüntüsünü gönder.
3. 💬 Beğendiğin/beğenmediğin yerleri söyle (renkler, düzen, "şu kart büyük olsun" vb.).
4. ⭐ Ekstra özellik tablosundan hangilerini istediğini işaretle.
5. 🛠️ Ben **Faz 0**'ı (kurulum) başlatayım — sen hazır olduğunu söyleyince.

> **Şu an kod YAZMIYORUZ.** Önce planı onaylıyor ve tasarım fikrini netleştiriyoruz. Sonra beraber inşa ederiz.
