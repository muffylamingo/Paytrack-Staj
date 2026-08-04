# 💸 PayTrack — Kurumsal Fatura Yönetim Sistemi

> Şirketlerin gelen faturalarını kaydettiği, ödeme durumlarını takip ettiği ve aylık
> giderlerini raporladığı tam yığın (full-stack) web uygulaması.
>
> **ODAKENT Çevre Bilişim A.Ş. — Staj Projesi**

<p>
  <img alt="Python" src="https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.140-009688?logo=fastapi&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white">
  <img alt="Keycloak" src="https://img.shields.io/badge/Keycloak-26-4D4D4D?logo=keycloak&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white">
</p>

---

## 📑 İçindekiler

- [Ne yapar?](#-ne-yapar)
- [Hızlı başlangıç](#-hızlı-başlangıç-4-adım)
- [Giriş bilgileri ve roller](#-giriş-bilgileri-ve-roller)
- [Özellikler](#-özellikler)
- [Mimari](#️-mimari)
- [Teknoloji seçimleri ve gerekçeleri](#-teknoloji-seçimleri-ve-gerekçeleri)
- [Veritabanı şeması](#️-veritabanı-şeması)
- [API uç noktaları](#-api-uç-noktaları)
- [Güvenlik](#️-güvenlik)
- [Öne çıkan teknik kararlar](#-öne-çıkan-teknik-kararlar)
- [Bilinen eksikler / üretim yol haritası](#️-bilinen-eksikler--üretim-yol-haritası)
- [Proje dokümanları](#-proje-dokümanları)

---

## 🎯 Ne yapar?

| | |
|---|---|
| 🧾 **Fatura yönetimi** | Fatura ekle, düzenle, "ödendi" işaretle, sil |
| 🔎 **Gelişmiş sorgulama** | Tedarikçi araması + durum/kategori filtresi + her sütuna göre sıralama |
| 📊 **Gösterge paneli** | 3 KPI kartı, kategori dağılımı (donut), 6 aylık trend (alan grafiği) |
| 🔔 **Otomatik hatırlatıcı** | Son ödeme tarihi **bugün** olan faturalar için uyarı bandı |
| 📅 **Ödeme takvimi** | Hangi gün ne ödenecek — ay görünümü |
| 💰 **Bütçe takibi** | Kategoriye aylık limit; %80'de uyarı, %100'de aşım alarmı |
| 💱 **Çoklu para birimi** | USD/EUR faturalar düzenlenebilir kurla TL'ye çevrilir |
| 🔁 **Tekrarlayan faturalar** | Kira/abonelik için otomatik dönem üretimi |
| 📎 **Dosya eki** | Her faturaya dekont (PDF/JPG/PNG) |
| 📥📤 **Excel** | Dışa aktarma **ve** içe aktarma (satır satır hata raporuyla) |
| 📜 **İşlem geçmişi** | Kim, ne zaman, neyi değiştirdi — otomatik kayıt |
| 🌙 **Karanlık mod** | Tüm palet uyumlu |
| 🌍 **Çift dil** | Türkçe / İngilizce (sayı ve tarih biçimleri dahil) |
| 🔐 **Keycloak girişi** | Rol bazlı yetkilendirme |

---

## 🚀 Hızlı başlangıç (4 adım)

### Gereksinimler
| Araç | Sürüm |
|---|---|
| Docker Desktop | 4.x+ *(çalışır durumda olmalı)* |
| Python | 3.12+ |
| Node.js | 20+ |

### 1️⃣ Depoyu klonla
```bash
git clone https://github.com/muffylamingo/Paytrack-Staj.git
```
```bash
cd Paytrack-Staj
```

### 2️⃣ Veritabanı + Keycloak'ı başlat
```bash
docker compose up -d
```
> ⏳ Keycloak ilk açılışta **1–2 dakika** sürebilir. Hazır olduğunu şuradan anlarsın:
> <http://localhost:8080/realms/paytrack/.well-known/openid-configuration> — JSON dönüyorsa hazır.

### 3️⃣ Backend *(yeni terminal — açık bırak)*
```bash
cd backend
```
```bash
python -m venv .venv
```
```bash
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```
```bash
.\.venv\Scripts\python.exe -m alembic upgrade head
```
```bash
.\.venv\Scripts\python.exe seed.py
```
```bash
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
> 📄 API dokümanı: <http://localhost:8000/docs>
>
> `alembic upgrade head` **tabloları** oluşturur, `seed.py` **örnek veriyi** yükler
> (13 fatura + 3 bütçe + döviz kurları).

### 4️⃣ Frontend *(başka bir terminal — açık bırak)*
```bash
cd frontend
```
```bash
npm install
```
```bash
npm run dev
```
> 🎉 Uygulama: **<http://localhost:5173>** → Keycloak giriş ekranı karşılar.

<details>
<summary><b>❓ Sık karşılaşılan sorunlar</b></summary>

| Belirti | Sebep | Çözüm |
|---|---|---|
| `connection refused` (Postgres) | Docker kapalı | Docker Desktop'ı aç → `docker compose up -d` |
| Giriş ekranı gelmiyor / beyaz ekran | Keycloak henüz açılmadı | 1–2 dk bekle, sayfayı yenile |
| `Geçersiz parametre: redirect_uri` | Vite **5174**'te açılmış (5173 dolu) | Eski `node` süreçlerini kapat, tek Vite çalıştır |
| `address already in use` | Port 8000/5173 dolu | Eski süreci kapat |
| Ekranlar boş | Örnek veri yüklenmedi | `.\.venv\Scripts\python.exe seed.py` |
| `relation "invoices" does not exist` | Migration çalıştırılmadı | `alembic upgrade head` |

</details>

---

## 🔐 Giriş bilgileri ve roller

Kullanıcılar `keycloak/paytrack-realm.json` dosyasında tanımlı ve Keycloak her açıldığında
**otomatik kurulur** — elle ayar yapmaya gerek yoktur.

| Kullanıcı | Şifre | Rol | Yetkileri |
|---|---|---|---|
| `mudur` | `paytrack123` | **Müdür** | Her şey (silme, bütçe, kur dahil) |
| `stajyer` | `paytrack123` | **Muhasebe** | Fatura ekle/düzenle/öde, dosya yükle |
| `izleyici` | `paytrack123` | **Görüntüleyici** | Sadece okuma |

**Yetki matrisi** *(canlı test sonuçları)*

| | Fatura ekle | Ödeme yap | Bütçe değiştir | Fatura sil |
|---|:---:|:---:|:---:|:---:|
| Müdür | ✅ 201 | ✅ 200 | ✅ 200 | ✅ 204 |
| Muhasebe | ✅ 201 | ✅ 200 | ⛔ 403 | ⛔ 403 |
| Görüntüleyici | ⛔ 403 | ⛔ 403 | ⛔ 403 | ⛔ 403 |

> 🔒 5 kez yanlış şifre → hesap **1 dakika kilitlenir** (kaba kuvvet koruması).
> Keycloak yönetim paneli: <http://localhost:8080> (`admin` / `admin`)
>
> ⚠️ Bunlar **yerel geliştirme** kimlik bilgileridir. Gerçek bir kurulumda kullanıcılar
> dosyada tutulmaz ve şifreler böyle basit olmaz.

---

## ✨ Özellikler

### PDF'te istenen çekirdek aşamalar
- [x] **1.** Veritabanı şeması
- [x] **2.** Backend CRUD (POST / GET / PATCH pay / GET stats)
- [x] **3.** Frontend ekranlar (fatura formu, liste, arama)
- [x] **4.** Gelişmiş sorgulama (filtre + sıralama)
- [x] **5.** Gösterge paneli + Excel dışa aktarma

### 🏆 Challenge görevleri
- [x] **Otomatik hatırlatıcı** — son ödemesi bugün olan faturalar için uyarı
- [x] **Keycloak ile kullanıcı doğrulama** — üzerine rol bazlı yetkilendirme eklendi

### ⭐ Ekstra olarak eklenenler (11)
🌙 Karanlık mod · 📈 KPI trend okları · 🔔 Toast bildirimleri · 📎 Dosya eki ·
🔁 Tekrarlayan faturalar · 💰 Bütçe uyarısı · 📥 Excel içe aktarma ·
💱 Çoklu para birimi · 🌍 Çift dil · 📜 İşlem geçmişi · 📅 Ödeme takvimi

---

## 🏗️ Mimari

```
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   React + Vite   │  JWT   │     FastAPI      │  SQL   │   PostgreSQL 16  │
│  localhost:5173  ├───────>│  localhost:8000  ├───────>│  localhost:5432  │
└────────┬─────────┘        └────────┬─────────┘        └──────────────────┘
         │                           │
         │ giriş / token             │ token imzasını doğrula (JWKS)
         v                           v
      ┌────────────────────────────────────┐
      │      Keycloak — localhost:8080     │
      │   realm: paytrack · rol yönetimi   │
      └────────────────────────────────────┘
```

### Klasör yapısı
```
Paytrack-Staj/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI uygulaması, CORS, router bağlama
│   │   ├── config.py       # ayarlar (.env okuma)
│   │   ├── database.py     # SQLAlchemy motoru, oturum, Base
│   │   ├── models.py       # tablolar (Invoice, Budget, ExchangeRate, AuditLog, User)
│   │   ├── schemas.py      # Pydantic giriş/çıkış şemaları
│   │   ├── crud.py         # veritabanı işlemleri + iş mantığı
│   │   ├── auth.py         # Keycloak JWT doğrulama + rol kontrolü
│   │   ├── audit.py        # otomatik işlem geçmişi (SQLAlchemy olay dinleyicisi)
│   │   ├── storage.py      # dosya eki: diske yazma + güvenlik kontrolleri
│   │   ├── excel_io.py     # Excel okuma / şablon üretme
│   │   └── routers/        # HTTP katmanı (invoices, budgets, rates, stats, audit)
│   ├── alembic/            # veritabanı migration'ları
│   └── seed.py             # örnek veri
├── frontend/src/
│   ├── api/                # axios istemcisi + uç nokta sarmalayıcıları
│   ├── auth/               # Keycloak istemcisi + rol yardımcıları
│   ├── components/         # Sidebar, Topbar, modallar, BudgetBar...
│   ├── context/            # Tema, Dil, Toast (React Context)
│   ├── i18n/               # tr.js / en.js sözlükleri
│   ├── lib/format.js       # para/tarih biçimlendirme
│   └── pages/              # Dashboard, Invoices, Calendar, Reports, History
├── keycloak/
│   ├── paytrack-realm.json # realm + kullanıcılar + roller (otomatik içe aktarılır)
│   └── themes/paytrack/    # özel giriş ekranı teması
└── docker-compose.yml      # PostgreSQL + Keycloak
```

**Katmanlı mimari:** `router` (HTTP) → `crud` (iş mantığı) → `models` (veritabanı).
Her katman yalnızca bir alt katmanı tanır; bu sayede test etmek ve değiştirmek kolaydır.

---

## 🔧 Teknoloji seçimleri ve gerekçeleri

| Katman | Seçim | Neden bu? |
|---|---|---|
| API | **FastAPI** | Otomatik doğrulama (Pydantic) + otomatik API dokümanı (`/docs`) |
| ORM | **SQLAlchemy 2.0** | Python'daki fiili standart; tipli `Mapped[]` sözdizimi |
| Migration | **Alembic** | Şema değişikliklerini sürümler; herkeste aynı şemayı garanti eder |
| Sürücü | **psycopg 3** | Python 3.14 için hazır wheel'i var (psycopg2 derleme istiyor) |
| Veritabanı | **PostgreSQL 16** | Kurumsal standart; `NUMERIC` ile hatasız para hesabı |
| Frontend | **React 19 + Vite** | Bileşen tabanlı; Vite çok hızlı geliştirme sunucusu |
| Stil | **Tailwind CSS v4** | Tema değişkenleri sayesinde karanlık mod tek yerden yönetiliyor |
| Grafik | **Recharts** | React'e özel, bildirimsel API |
| Excel | **openpyxl** | Sadece `.xlsx` için; pandas bu iş için gereksiz ağır olurdu |
| Kimlik | **Keycloak** | Şifre saklama / oturum yönetimi gibi riskli işleri kendimiz yazmıyoruz |
| Token | **PyJWT + JWKS** | İmza doğrulaması; her istekte Keycloak'a gitmeye gerek yok |

---

## 🗄️ Veritabanı şeması

```
invoices                              budgets
├─ id                                 ├─ id
├─ invoice_number                     ├─ category        UNIQUE
├─ vendor_name                        ├─ monthly_limit   NUMERIC(12,2)
├─ category                           └─ currency
├─ amount              NUMERIC(12,2)
├─ currency                           exchange_rates
├─ due_date                           ├─ id
├─ status                             ├─ currency        UNIQUE
├─ notes                              └─ rate            NUMERIC(12,4)
├─ recurrence
├─ recurrence_parent_id ──┐           audit_logs
├─ attachment_name        │           ├─ id
├─ attachment_path        │           ├─ entity / entity_id / entity_label
├─ created_at             │           ├─ action          create | update | delete
├─ paid_at                │           ├─ changes         JSON  {alan: {old, new}}
└─ user_id                │           ├─ username
                          │           └─ created_at
      kendine referans ───┘
      (ON DELETE SET NULL)
```

> 💡 Para alanları **her zaman `NUMERIC` / `Decimal`** — `float` kullanılsaydı
> `0.1 + 0.2 ≠ 0.3` yuvarlama hatası muhasebede kabul edilemez sonuçlar doğururdu.
>
> 💡 `recurrence_parent_id` **kendine referans** veren bir yabancı anahtardır ve
> `ON DELETE SET NULL` ile tanımlıdır: seri başı silinse bile kesilmiş faturalar **yok olmaz**.

---

## 🔌 API uç noktaları

Tam ve interaktif liste: **<http://localhost:8000/docs>**

<details>
<summary><b>Uç nokta tablosu (20 adet)</b></summary>

| Metot | Yol | Gereken yetki |
|---|---|---|
| `GET` | `/` | — *(sağlık kontrolü, herkese açık)* |
| `GET` | `/me` | giriş |
| `GET` | `/invoices` | giriş |
| `POST` | `/invoices` | müdür, muhasebe |
| `GET` | `/invoices/{id}` | giriş |
| `PUT` | `/invoices/{id}` | müdür, muhasebe |
| `PATCH` | `/invoices/{id}/pay` | müdür, muhasebe |
| `DELETE` | `/invoices/{id}` | **müdür** |
| `GET` | `/invoices/export` | giriş |
| `GET` | `/invoices/import-template` | giriş |
| `POST` | `/invoices/import` | müdür, muhasebe |
| `POST` | `/invoices/generate-recurring` | müdür, muhasebe |
| `POST` | `/invoices/{id}/attachment` | müdür, muhasebe |
| `GET` | `/invoices/{id}/attachment` | giriş |
| `DELETE` | `/invoices/{id}/attachment` | müdür, muhasebe |
| `GET` | `/stats` | giriş |
| `GET` | `/budgets` | giriş |
| `PUT` | `/budgets/{kategori}` | **müdür** |
| `DELETE` | `/budgets/{kategori}` | **müdür** |
| `GET` `PUT` | `/rates` · `/rates/{para}` | giriş · **müdür** |
| `GET` | `/audit` | giriş *(sadece okuma — denetim kaydı değiştirilemez)* |

</details>

---

## 🛡️ Güvenlik

| Önlem | Uygulama |
|---|---|
| **Kimlik doğrulama** | Keycloak / OpenID Connect + PKCE. Uygulama kullanıcının şifresini **hiç görmez** |
| **Token doğrulama** | RS256 imza, JWKS ile açık anahtar, `issuer` + `azp` kontrolü, 30 sn saat toleransı |
| **Yetkilendirme** | Rol bazlı (RBAC), **router seviyesinde** — yeni uç nokta eklerken unutulamaz |
| **Kaba kuvvet** | 5 hatalı denemede geçici kilit; kilitliyken bile aynı hata mesajı *(user enumeration'a karşı)* |
| **Şifre politikası** | En az 8 karakter, kullanıcı adıyla aynı olamaz |
| **SQL enjeksiyonu** | ORM parametreli sorgu; sıralanabilir alanlar **beyaz listede** |
| **Dosya yükleme** | Tür beyaz listesi + 5 MB sınırı + dosya adını **sunucu üretir** (path traversal'a karşı) |
| **Girdi doğrulama** | Tüm istek gövdeleri Pydantic şemasından geçer (`amount > 0`, kategori enum...) |
| **Sırlar** | `.env` **git'e girmez**; depoda yalnızca `.env.example` bulunur |
| **Denetim kaydı** | Her değişiklik otomatik loglanır; log uç noktasında yazma işlemi **yoktur** |

> ⚠️ Arayüzdeki buton kısıtları yalnızca kullanıcı deneyimi içindir.
> Gerçek kontrol **her zaman backend'de** yapılır — tarayıcıdaki JavaScript'e güvenilmez.

---

## 💡 Öne çıkan teknik kararlar

<details>
<summary><b>1. Türetilebilen veri saklanmaz</b></summary>

Bütçenin "harcanan" tutarı ve faturaların "TL karşılığı" veritabanında **tutulmaz**, her istekte
hesaplanır. Saklansaydı bir fatura silindiğinde veya kur değiştiğinde bu değerler yanlış kalırdı.
Tek doğru kaynak (single source of truth) faturaların kendisidir.
</details>

<details>
<summary><b>2. İşlem geçmişi kod yazılmadan çalışır</b></summary>

Her uç noktaya "log ekle" satırı yazmak yerine SQLAlchemy'nin `before_flush` olayı dinlenir.
Veritabanına giden **her** değişiklik — hangi alanın eski/yeni değeriyle birlikte — otomatik
kaydedilir. Yeni bir uç nokta yazan kişi loglamayı **unutamaz**.
</details>

<details>
<summary><b>3. Tekrarlayan fatura üretimi idempotenttir</b></summary>

"Tekrarları Oluştur" düğmesine kaç kez basılırsa basılsın kopya oluşmaz: üretimden önce serinin
en ileri tarihine bakılır. Ayrıca ay sonu taşması (31 Ocak + 1 ay = 28 Şubat) ve artık yıl
ayrıca ele alınır.
</details>

<details>
<summary><b>4. Excel içe aktarmada "kısmi başarı" stratejisi</b></summary>

Geçerli satırlar alınır, hatalı satırlar **satır numarası ve sebebiyle** raporlanır.
500 satırın 1'i bozuk diye 499'unu geri çevirmek kullanıcıyı yorardı.
Satır doğrulaması için yeni kural yazılmadı — mevcut Pydantic şeması yeniden kullanıldı,
böylece API ile Excel **aynı kuralları** paylaşır.
</details>

<details>
<summary><b>5. Karanlık mod: anlamsal renk değişkenleri</b></summary>

Her bileşene `dark:` sınıfı yazmak yerine renkler CSS değişkeni olarak tanımlandı; karanlık modda
yalnızca **değişkenlerin değerleri** takas edilir, bileşenlere hiç dokunulmaz.
</details>

<details>
<summary><b>6. Çoklu para birimi: TL karşılığı saklanmaz</b></summary>

Fatura kendi para biriminde saklanır; TL karşılığı düzenlenebilir kur tablosundan anlık hesaplanır.
Böylece kur değiştiğinde geçmiş veriler bozulmaz. Bu özellik aynı zamanda önceki bir hatayı da
düzeltti: öncesinde farklı para birimleri doğrudan toplanıyordu.
</details>

---

## ⚠️ Bilinen eksikler / üretim yol haritası

Bu bir **staj projesidir**. Gerçek bir kurumsal ortama alınmadan önce yapılması gerekenler
bilinçli olarak tespit edildi ve kapsam dışı bırakıldı:

| Öncelik | Eksik | Neden gerekli |
|:---:|---|---|
| 🔴 | **Sayfalama (pagination)** | `GET /invoices` tüm kayıtları döndürüyor; on binlerce faturada sorun olur |
| 🔴 | **API rate limit** | Uç noktalarda istek sınırlaması yok (`slowapi` / API gateway) |
| 🟠 | **Otomatik testler** | `pytest` + `vitest` — regresyonları yakalamak için |
| 🟠 | **CI/CD** | GitHub Actions ile her push'ta test + lint |
| 🟠 | **Güvenlik başlıkları** | `CSP`, `HSTS`, `X-Content-Type-Options` (ters vekil sunucuda) |
| 🟠 | **Log & izleme** | Yapılandırılmış log + hata izleme (ör. Sentry) |
| 🟠 | **Yedekleme** | PostgreSQL için otomatik yedek politikası |
| 🟡 | **HTTPS** | Üretimde TLS zorunlu (`sslRequired` ayarı hazır) |
| 🟡 | **Sır yönetimi** | `.env` yerine gizli anahtar yöneticisi |
| 🟡 | **KVKK** | Fatura verisi için saklama süresi ve silme politikası |
| 🟡 | **Erişilebilirlik** | Lighthouse denetimi yapılmadı |
| 🟡 | **Tutara göre sıralama** | Ham tutara göre sıralıyor; TL karşılığına göre değil |

> `AUTH_DISABLED` ortam değişkeni yalnızca geliştirme kolaylığı içindir ve
> üretim yapılandırmasında **bulunmamalıdır**.

---

## 📚 Proje dokümanları

| Dosya | İçerik |
|---|---|
| [PLAN.md](PLAN.md) | Yol haritası, teknoloji gerekçeleri, ekstra özellik tablosu |
| [ILERLEME.md](ILERLEME.md) | Faz faz ilerleme panosu |
| [CALISMA-NOTLARI.md](CALISMA-NOTLARI.md) | **Öğrenme notları** — her oturumda ne öğrenildi, hangi hatalar yapıldı ve nasıl çözüldü |
| [KOMUTLAR.md](KOMUTLAR.md) | Günlük başlatma / durdurma komutları |

---

<div align="center">

**PayTrack** · ODAKENT Çevre Bilişim A.Ş. Staj Projesi · 2026

</div>
