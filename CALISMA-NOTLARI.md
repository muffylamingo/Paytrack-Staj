# 📚 PayTrack — Çalışma Notlarım (Kendi Kendine Öğrenme + Sunum Hazırlığı)

> **Bu dosya ne için?** Her oturumun sonunda buraya, senin **kendi kendine çalışman/öğrenmen
> gereken konular** ekleniyor. Amaç: proje biterken hem kodu hem de arkasındaki mantığı anlamış
> olman ve **sunumu rahatça yapabilmen**.
>
> **Nasıl kullanılır?** Her başlığın anahtar kelimelerini Google/YouTube'da ara → öğrendiğini
> 1-2 cümle **kendi cümlelerinle** not al. Sunumda anlatacağın şey işte bu olacak.

---

## 🎤 Sunum İçin Altın Kurallar
- Her teknoloji için **"Bu ne?"** + **"Neden bunu seçtik?"** sorularına 1'er cümle hazır cevabın olsun.
- Jargon yerine sade anlat. Örn: *"Docker = uygulamayı bir kutuya koyup her bilgisayarda aynı çalıştırma."*
- **Canlı demo > slayt.** Uygulamayı açıp göstermek en etkileyicisidir.
- Sonda "neler öğrendim" diye 3 madde söyle — jüri/amir bunu sever.

---

## ✅ PDF Gereksinim Takibi (her şey uyumlu mu?)
| PDF İsteği | Bizim Karşılığımız | Durum |
|---|---|:---:|
| Frontend: React (Vite) | React + Vite | ✅ |
| Frontend: Tailwind CSS | Tailwind CSS | ✅ |
| Backend: Python (FastAPI) | FastAPI | ✅ |
| Veritabanı: PostgreSQL | PostgreSQL (Docker) | ✅ |
| Raporlama: Chart.js veya Recharts | Recharts | ✅ |
| ORM: SQLAlchemy veya Tortoise | SQLAlchemy | ✅ |
| Excel export: pandas veya openpyxl | openpyxl | ✅ |

> **Not:** Beğendiğimiz "Purple" teması aslında eski CRA + Bootstrap'tı (PDF'e uymuyordu). Biz onun
> sadece **görünüşünü** alıp PDF'in istediği **Vite + Tailwind** ile kurduğumuz için PDF'e **daha da**
> uygunuz. Her fazın sonunda bu tabloyu güncelleyeceğiz.

---

## 📖 Oturum 1 — Kurulum & Veritabanı (Faz 0)

### Çalışman gereken konular
1. **Docker & Container nedir?**
   - 🔎 Ara: *"docker nedir basit anlatım"*, *"container vs sanal makine"*
   - Özet: Uygulamayı ve ihtiyaçlarını izole bir "kutu"da çalıştıran teknoloji. Kurulum kolaylaşır, taşınabilir olur.
2. **Volume & Port kavramı**
   - **Volume** = container silinse bile verinin kalıcı kaldığı yer (bizim faturalar burada kalır).
   - **Port (5432)** = dışarıdan veritabanına bağlanılan "kapı". Backend buradan bağlanacak.
3. **PostgreSQL & ilişkisel veritabanı (SQL) mantığı**
   - 🔎 Ara: *"ilişkisel veritabanı nedir"*, *"tablo / satır / sütun / primary key / foreign key"*
4. **docker-compose ne işe yarar?**
   - 🔎 Ara: *"docker compose nedir"* — servisleri tek YAML dosyasıyla tanımlayıp `docker compose up` ile başlatmak.
5. **Node/npm ve Python/pip** ne işe yarar (paket yöneticileri).

### 🎤 Sunumda söyleyebileceğin cümle
> *"Veritabanını bilgisayara doğrudan kurmak yerine Docker container'ında çalıştırdım; böylece tek
> komutla, temiz ve taşınabilir bir ortam elde ettim."*

---

## 📖 Oturum 1 (devam) — Backend Ortamı (Faz 1 başlangıç)

### Çalışman gereken konular
1. **Sanal ortam (venv) nedir, neden kullanılır?**
   - 🔎 Ara: *"python venv nedir ne işe yarar"*
   - Özet: Her projenin kütüphaneleri kendi izole klasöründe dursun ki projeler birbirini bozmasın.
2. **pip & requirements.txt**
   - `requirements.txt` = projenin ihtiyaç duyduğu kütüphanelerin listesi. `pip install -r` ile hepsi tek seferde kurulur.
3. **Kuracağımız kütüphaneler — her biri ne işe yarar? (bunları sunumda anlatabilmelisin)**
   | Kütüphane | Görevi |
   |---|---|
   | **FastAPI** | Web API'sini (endpoint'leri) yazdığımız çatı |
   | **Uvicorn** | FastAPI uygulamasını çalıştıran sunucu |
   | **SQLAlchemy** | Veritabanı tablolarını Python sınıfı olarak yazmamızı sağlayan ORM |
   | **Alembic** | Tablo değişikliklerini veritabanına uygulayan "migration" aracı |
   | **psycopg** | Python'un PostgreSQL ile konuşmasını sağlayan sürücü (v3, modern) |
   | **pydantic-settings** | Ayarları `.env` dosyasından güvenle okumak |
4. **ORM nedir, neden ham SQL yerine kullanırız?**
   - 🔎 Ara: *"ORM nedir avantajları"* — SQL yazmadan Python nesneleriyle veritabanı yönetmek.

### 🎤 Sunumda söyleyebileceğin cümle
> *"Veritabanı işlemlerini ham SQL yerine SQLAlchemy (ORM) ile yaptım; tabloları Python sınıfı
> olarak tanımladım, bu da kodu daha okunur ve hatasız yaptı."*

---

## 📖 Oturum 1 (devam) — Tablolar & Migration (Faz 1 tamamlandı ✅)

### Çalışman gereken konular
1. **SQLAlchemy modeli = tablo** — Bir Python sınıfı bir veritabanı tablosuna karşılık gelir; her `mapped_column` bir sütun.
2. **Primary key & index nedir?**
   - 🔎 Ara: *"primary key nedir"*, *"veritabanı index ne işe yarar"* (arama/filtrelemeyi hızlandırır).
3. **Foreign key & ilişki (relationship)** — `invoices.user_id` → `users.id`. Bir faturayı bir kullanıcıya bağlar (1 kullanıcı → N fatura).
4. **Neden para için `Decimal`, `float` değil?** — float yuvarlama hatası yapar; parada `Numeric/Decimal` kullanılır.
5. **Migration & Alembic nedir?** (ÇOK ÖNEMLİ — sunumluk)
   - 🔎 Ara: *"database migration nedir"*, *"alembic autogenerate nedir"*
   - Özet: Tabloları elle SQL yazarak değil, modellere bakan Alembic'in ürettiği "migration" dosyalarıyla oluşturur/değiştiririz. Değişiklikler versiyonlanır ve geri alınabilir.

### 🎤 Sunumda söyleyebileceğin cümle
> *"Veritabanı tablolarını elle SQL yazarak değil, SQLAlchemy modellerimden Alembic ile otomatik
> ürettim; böylece şema değişikliklerim tıpkı kod gibi versiyonlandı ve geri alınabilir oldu."*

---

## 📖 Oturum 2 — Backend Sunucusu & FastAPI (derinlemesine) 🎯

> Bu senin özellikle merak ettiğin konu — "biraz biliyorum ama detay eksik" dediğin FastAPI.
> İşte adım adım çalışma haritan. (Anahtar kelimeleri ara, kısa kendi özetini yaz.)

### 1. Önce temel: REST API & HTTP
- 🔎 Ara: *"REST API nedir"*, *"HTTP metodları GET POST PUT PATCH DELETE"*, *"HTTP durum kodları 200 201 404 422"*
- Özet: İstemci (tarayıcı / React) ile sunucu (FastAPI) belirli **yollar** (endpoint) ve **metodlar** üzerinden JSON konuşur.
  - **GET** = veriyi OKU · **POST** = YENİ oluştur · **PUT/PATCH** = GÜNCELLE · **DELETE** = SİL

### 2. FastAPI çekirdeği
- **Path operation & decorator:** `@app.get("/")` → `@app.<metod>("<yol>")` + hemen altındaki fonksiyon = bir endpoint.
- **Path parametresi:** `/invoices/{id}` → fonksiyona `id: int` olarak gelir.
- **Query parametresi:** `/invoices?status=Ödendi` → `status: str | None = None`.
- **Request body:** POST/PUT'ta gövdeden gelen JSON → Pydantic modeliyle karşılanır.
- 🔎 Ara: *"fastapi path parameters"*, *"fastapi query parameters"*, *"fastapi request body"*

### 3. Pydantic ile otomatik doğrulama (FastAPI'nin süper gücü)
- Gelen JSON **otomatik** doğrulanır; tip yanlışsa FastAPI kendisi **422** hatası döner — sen tek satır kontrol yazmazsın.
- 🔎 Ara: *"pydantic BaseModel nedir"*, *"fastapi response_model ne işe yarar"*

### 4. Otomatik dokümantasyon (ŞU AN BAKTIĞIN SAYFA!)
- FastAPI, kodundan bir **OpenAPI** şeması üretir; `/docs` (Swagger UI) ve `/redoc` bunu gösterir.
- **"Try it out" → "Execute"** ile endpoint'i tarayıcıdan çağırırsın. Postman'e gerek kalmaz.
- 🔎 Ara: *"swagger ui nedir"*, *"openapi nedir"*

### 5. Bağımlılık enjeksiyonu — `Depends` (birazdan kullanacağız)
- `Depends(get_db)` ile her isteğe **otomatik bir veritabanı oturumu** verilir; iş bitince kapanır.
- 🔎 Ara: *"fastapi depends dependency injection nedir"*

### 6. `async def` vs normal `def`
- Endpoint'i ikisiyle de yazabilirsin. Biz şimdilik normal `def` kullanacağız (basit ve yeterli).
- 🔎 Ara: *"fastapi async def vs def farkı"*

### 🎤 Sunumda söyleyebileceğin cümle
> *"Backend'i FastAPI ile yazdım; gelen verileri Pydantic otomatik doğruluyor ve FastAPI kodumdan
> otomatik bir Swagger dokümantasyonu (/docs) üretiyor — API'yi oradan canlı test edebiliyorum."*

### ✅ Mini hedef (kendin dene)
`/docs` → `GET /` → **"Try it out"** → **"Execute"** → dönen JSON'u ve **HTTP 200** kodunu gör.

---

## 📖 Oturum 2 (devam) — Fatura Endpoint'leri / CRUD ✅

### Neler yaptık
Faturalar için tam CRUD: `POST /invoices`, `GET /invoices` (+ filtreler), `GET /invoices/{id}`,
`PUT /invoices/{id}`, `PATCH /invoices/{id}/pay`, `DELETE /invoices/{id}`.

### Çalışman gereken konular
1. **CRUD nedir?** Create-Read-Update-Delete = veriyle yapılan 4 temel işlem.
2. **Neden 3 ayrı Pydantic şeması?** (Create / Update / Out)
   - `InvoiceCreate`: dışarıdan GELEN veri (kullanıcı id/tarih göndermez).
   - `InvoiceUpdate`: güncellemede sadece DEĞİŞEN alanlar (hepsi opsiyonel, `exclude_unset`).
   - `InvoiceOut`: dışarıya DÖNEN veri (id, created_at dahil). `from_attributes=True` ile DB nesnesinden okunur.
   - 🔎 Ara: *"pydantic from_attributes orm mode"*, *"neden ayrı request response şeması"*
3. **APIRouter:** endpoint'leri ayrı dosyada toplayıp `include_router` ile ana app'e bağlama (düzenli kod).
4. **Depends(get_db):** her isteğe otomatik DB oturumu açılır, iş bitince kapanır. 🔎 *"fastapi depends database session"*
5. **HTTPException & durum kodları:** yoksa `404`, oluşturunca `201`, silince `204`, doğrulama hatası `422`.
6. **Katmanlı mimari:** `routers` (HTTP) → `crud` (veritabanı işlemleri) → `models` (tablolar). Her katmanın tek görevi var.

### 🎤 Sunumda söyleyebileceğin cümle
> *"Faturalar için tam bir CRUD API yazdım ve kodu katmanlara ayırdım: router'lar HTTP'yi, crud katmanı
> veritabanı işlemlerini, modeller tabloları yönetiyor. Gelen ve dönen veriyi ayrı Pydantic şemalarıyla
> doğruladım; FastAPI de bunları /docs'ta otomatik test edilebilir hale getirdi."*

---

## 📖 Oturum 3 — Frontend Başlangıç (Vite + React + Tailwind + Organic tema) 🎨

### Neler yaptık
`frontend/` projesini **Vite** ile kurduk; **Tailwind CSS v4** ekledik; **"Organic"** (krem/kil) renk
paletini tanımladık; ilk ekranı yaptık (PayTrack karşılama + **canlı backend bağlantısı**). React →
FastAPI → PostgreSQL zinciri baştan sona çalışıyor (ekranda "kayıtlı fatura: 3" göründü).

### Çalışman gereken konular
1. **Vite nedir?** 🔎 *"vite nedir ne işe yarar"* — çok hızlı React geliştirme sunucusu + derleyici (HMR = anlık güncelleme).
2. **React bileşeni (component) & JSX:** `function App()` bir bileşendir; JSX = JS içinde HTML benzeri yazım.
3. **useState & useEffect:** 🔎 *"react useState useEffect nedir"*
   - `useState`: bileşenin hafızası (örn. fatura sayısı).
   - `useEffect`: sayfa açılınca bir şey yap (örn. backend'den veri çek).
4. **fetch ile API çağrısı:** `fetch("http://localhost:8000/invoices")` → backend'den JSON al.
5. **CORS:** Frontend (5173) ve backend (8000) farklı port; backend'de CORS izni verdik. 🔎 *"cors nedir neden gerekli"*
6. **Tailwind CSS (v4):** hazır sınıflarla stil (`bg-clay-500`, `rounded-xl`…). Renk paletini `index.css` içindeki `@theme` bloğunda tanımladık. 🔎 *"tailwind css utility class nedir"*

### 🎤 Sunumda söyleyebileceğin cümle
> *"Frontend'i React + Vite ile kurdum, Tailwind ile 'organic' bir tema tasarladım. Sayfa açılınca React,
> FastAPI backend'ime istek atıp verileri çekiyor — yani frontend, backend ve veritabanı uçtan uca çalışıyor."*

---

## 📖 Oturum 3 (devam) — Layout + Faturalar Ekranı (React Router, axios, formlar) ✅

### Neler yaptık
Organic temalı **layout** (sol menü + üst bar) + **tam işlevsel Faturalar sayfası**: canlı tablo, arama,
durum/kategori filtresi, durum rozetleri, "yaklaşan = kırmızı" vurgu, tek tıkla "Öde" ve "Yeni Fatura"
formu. Menüde sadece gerekli 3 öğe var (template'in gereksiz demo sayfaları YOK).

### Çalışman gereken konular
1. **React Router:** 🔎 *"react router dom nedir"* — URL'ye göre farklı sayfa göstermek (`/faturalar`, `/panel`). `<Routes>`, `<Route>`, `<NavLink>`, `<Outlet>`.
2. **Bileşen (component) mimarisi:** Sayfayı küçük parçalara böldük (Sidebar, Topbar, Layout, tablo, form). Her parça ayrı dosya = düzen.
3. **axios ile API katmanı:** `src/api/` içinde tüm backend çağrıları tek yerde toplandı. 🔎 *"axios get post nedir"*
4. **useEffect ile veri çekme + "debounce":** Aramada her harfte istek atmamak için 300ms bekliyoruz. 🔎 *"react debounce search"*
5. **Kontrollü form (controlled inputs):** Form alanları React state'ine bağlı (`value` + `onChange`). 🔎 *"react controlled form"*
6. **Koşullu render:** `loading ? … : …`, `status !== 'Ödendi' && <button>` — duruma göre farklı JSX.
7. **Tailwind + tema token'ları:** `bg-clay-500`, `text-bark-900`, durum rozetleri (`bg-paid-bg`) — hepsi `index.css`'teki `@theme`'den.

### 🎤 Sunumda söyleyebileceğin cümle
> *"Frontend'i bileşenlere ayırdım (menü, üst bar, tablo, form) ve React Router ile sayfa yönlendirmesi
> kurdum. Faturalar ekranı backend'den canlı veri çekiyor; arama, filtre, durum rozetleri ve tek tıkla
> ödeme işaretleme var. Tüm stilleri Tailwind ile 'organic' temada yaptım."*

---

## 📖 Oturum 4 — Sıralama (Sorting) ✅

### Neler yaptık
Tablo başlıklarına (Tedarikçi, Tutar, Son Ödeme, Durum) tıklayınca artan/azalan sıralama. Backend'e
`?sort=` + `?order=` parametreleri, frontend'e tıklanabilir başlıklar + ok göstergesi.

### Çalışman gereken konular
1. **Backend'de sıralama:** SQLAlchemy `order_by(column.asc() / column.desc())`. **Güvenlik:** sadece izin verilen sütunlar (`SORTABLE` sözlüğü) — kullanıcı rastgele sütun/SQL gönderemez.
2. **`Literal` ile parametre doğrulama:** FastAPI'de `Literal["asc","desc"]` → sadece bu değerler kabul edilir, `/docs`'ta dropdown olur. 🔎 *"python typing Literal fastapi query"*
3. **Frontend'de sıralama durumu:** `sort` + `order` state; başlığa tıklayınca aynı sütunsa yön çevir, farklıysa o sütuna geç.
4. **useEffect bağımlılıkları:** `sort`/`order` değişince listeyi yeniden çek (dependency array'e ekledik).

### 🎤 Sunumda söyleyebileceğin cümle
> *"Sıralamayı hem backend'de (güvenli — sadece izinli sütunlar) hem frontend'de yaptım; başlığa
> tıklayınca yön değişiyor ve liste anında yeniden sıralanıyor."*

---

## 📖 Oturum 5 — Dashboard & Grafikler (Recharts) ✅ *(Excel hariç)*

### Neler yaptık
Backend'e `GET /stats` (özet hesaplama) + örnek veri (`seed.py`). Frontend'de **Gösterge Paneli**:
3 KPI kartı + pasta grafik (kategori dağılımı) + çizgi grafik (6 aylık trend) — **Recharts** ile, organic renklerde.

### Çalışman gereken konular
1. **Veri toplama (aggregation):** Backend'de tüm faturaları gezip toplam/gruplama hesapladık (kategoriye, aya göre). 🔎 *"python sözlükle gruplama toplama"*
2. **Tarih mantığı:** gecikmiş (`due_date < bugün` ve ödenmemiş), 7 gün içinde, bu ay — `date`/`timedelta` ile.
3. **Recharts:** React grafik kütüphanesi. `PieChart/Pie/Cell` (pasta), `LineChart/Line/XAxis/YAxis` (çizgi), `ResponsiveContainer` (responsive). 🔎 *"recharts pie line chart örnek"*
4. **Veriyi grafiğe hazırlama:** `stats.by_category` → `[{name, value}]`, `monthly_trend` → `[{name, total}]`.
5. **Seed (örnek veri):** Demo/sunum için gerçekçi veri üretmek yaygın bir pratiktir.
6. **(Not) Para birimi:** Farklı dövizler şimdilik tek sayıda toplanıyor (basitleştirme); kur dönüşümü ekstra özellik (#8).

### 🎤 Sunumda söyleyebileceğin cümle
> *"Dashboard için backend'de bir `/stats` endpoint'i yazdım; tüm faturaları gruplayıp toplam borç,
> kategori dağılımı ve aylık trendi hesaplıyor. Frontend'de Recharts ile pasta ve çizgi grafik olarak
> organic temada gösterdim."*

---

### (Ek) Dashboard görsel iyileştirme
KPI kartlarını **gradyanlı + ikonlu + baloncuklu** yaptık (CSS `linear-gradient` + lucide ikon). Pasta →
**donut** (ortada toplam) + yüzdeli açıklama. Çizgi → **AreaChart** (dolgulu gradyan). "Bu Ay" kartında
geçen aya göre **trend oku** (ekstra özellik #2 — KPI Trend Okları). 🔎 *"recharts area chart gradient"*, *"css linear-gradient"*

---

## 📖 Oturum 5 (devam) — Excel Dışa Aktarma + bir hata ayıklama dersi ✅

### Neler yaptık
`GET /invoices/export` → **openpyxl** ile `.xlsx` üretip indirilebilir dosya olarak döndürür (başlık
kalın, kolon genişlikleri, mevcut filtre/sıralamaya uyar). Frontend'de **"Excel'e Aktar"** butonu.

### Çalışman gereken konular
1. **openpyxl:** Python'da Excel oluşturma — `Workbook()`, `ws.append([...])`, hücre stili (`Font(bold=True)`), kolon genişliği. 🔎 *"openpyxl workbook örnek"*
2. **Dosya indirme (backend):** FastAPI `Response(content=..., media_type=..., headers={"Content-Disposition": "attachment; filename=..."})`. 🔎 *"fastapi file download response"*
3. **Dosya indirme (frontend):** Gizli bir `<a>` linki oluşturup tıklatarak indirme. 🔎 *"javascript trigger download anchor"*
4. **Route sırası önemli:** `/invoices/export`, `/invoices/{id}`'den ÖNCE tanımlanmalı (yoksa "export" bir id sanılır).
5. **🐞 Hata ayıklama dersi:** DB'ye dokunan endpoint (`/invoices`) donuyor ama `/` çalışıyorsa → **veritabanı ayakta değildir!** (Docker Desktop kapanmış → Postgres yoktu.) Önce `docker ps` ile kontrol et. Veri kalıcı volume'da güvende kalır.

### 🎤 Sunumda söyleyebileceğin cümle
> *"Faturaları Excel'e aktarmak için backend'de openpyxl ile bir `.xlsx` üretip indirme olarak
> döndürdüm; buton mevcut filtreye göre indiriyor. Böylece raporlama aşaması da tamamlandı."*

---

## 📖 Oturum — GitHub'a Yükleme (Git) ✅

Projeyi GitHub'a push ettik: **https://github.com/muffylamingo/Paytrack-Staj**

### Çalışman gereken konular
1. **Git temel akışı:** `git init` (repo başlat) → `git add .` (değişiklikleri hazırla) → `git commit -m "mesaj"` (kaydet) → `git push` (GitHub'a gönder). 🔎 *"git temel komutlar"*
2. **.gitignore:** Gizli/gereksiz dosyaları (`.env`, `node_modules`, `.venv`) git dışında tutar. **Şifreler ASLA git'e girmemeli!**
3. **remote / origin / branch:** `origin` = GitHub'daki uzak kopya; `main` = ana dal.
4. **Sonraki değişiklikleri gönderme:** `git add .` → `git commit -m "ne yaptın"` → `git push` (3 komut).

### 🎤 Sunumda söyleyebileceğin cümle
> *"Projeyi Git ile versiyonladım ve GitHub'a yükledim; `.gitignore` ile hassas dosyaları (veritabanı
> şifreleri) repoya girmeyecek şekilde hariç tuttum."*

---

## 📖 Oturum 6 — Otomatik Hatırlatıcı + bir süreç (process) dersi ✅

### Neler yaptık
Son ödeme tarihi **bugün** olan (ödenmemiş) faturalar için tüm sayfaların üstünde kapatılabilir bir
uyarı bandı. Backend `/stats`'e `due_today` listesi eklendi; frontend'de `ReminderBanner` bileşeni
(`Layout`'a konuldu → her sayfada görünür).

### Çalışman gereken konular
1. **Tarih karşılaştırma:** `inv.due_date == date.today()` → bugün mü? Backend'de hesapladık.
2. **Koşullu render + kapatılabilir bileşen:** Banner sadece `due_today` doluysa görünür, `X` ile kapanır (`useState`).
3. **Ortak yerleşim:** Banner'ı `Layout`'a koyunca her sayfada çıkıyor (tek yerde yaz, her yerde kullan).
4. **🐞 Süreç (process) dersi — ÖNEMLİ:** Kod doğru olduğu hâlde değişiklik görünmüyorsa → **eski bir sunucu süreci portu (8000) tutuyor olabilir.** `uvicorn --reload` bazen eski "worker"ları bırakır. Çözüm: portu tutan süreçleri kapatıp tek temiz süreç başlat. 🔎 *"windows port 8000 kill process"*

### 🎤 Sunumda söyleyebileceğin cümle
> *"Son ödemesi bugün olan faturalar için otomatik bir uyarı bandı ekledim; backend her sayfa
> yüklendiğinde bugün ödenecekleri hesaplıyor ve kullanıcıyı uyarıyor."*

---

## 📖 Oturum 7 — Karanlık Mod (Ekstra Özellik #1) 🌙 ✅

### Neler yaptık
Tek tıkla **aydınlık ↔ karanlık** tema. Kritik nokta: sadece "arka planı siyah yapmak" değil —
**tüm palet** (kartlar, kenarlıklar, yazılar, durum rozetleri, grafik renkleri) koyu temaya uyumlu
karşılıklarına dönüşüyor. Tema seçimi tarayıcı hafızasında saklanıyor.

### 💡 İşin püf noktası: "Anlamsal (semantic) renk değişkenleri"
Her bileşene `dark:bg-...` yazmak yerine, renkleri **CSS değişkeni** olarak tanımladık ve karanlık
modda **sadece o değişkenlerin değerlerini** değiştirdik:

```css
@theme        { --color-cream-50: #FBF8F1; }  /* aydınlık: kart yüzeyi krem  */
.dark         { --color-cream-50: #231C15; }  /* karanlık: kart yüzeyi kahve */
```

`bg-cream-50` yazan **her yer** otomatik değişti — 8 bileşen dosyasına hiç dokunmadık. 🎯
Bu yüzden renkleri baştan `bg-white` gibi değil, **anlamlarıyla** (`cream`=yüzey, `bark`=yazı,
`clay`=vurgu) isimlendirmek çok değerli.

### Çalışman gereken konular
1. **CSS Custom Properties (değişkenler):** `--renk: değer` tanımla, `var(--renk)` ile kullan. Bir üst
   seçicide değerini değiştirince altındaki her şey etkilenir. 🔎 *"css custom properties variables"*
2. **Tailwind v4 karanlık mod:** `@custom-variant dark (&:where(.dark, .dark *));` → `<html class="dark">`
   olduğunda aktifleşir. (v4'te `tailwind.config.js` yok, her şey CSS'te.) 🔎 *"tailwind v4 dark mode class"*
3. **React Context API:** Veriyi bileşenden bileşene elden ele geçirmeden ("prop drilling") tüm ağaca
   yayma yöntemi. `createContext` → `<Provider value={...}>` → `useContext`. 🔎 *"react context api"*
4. **localStorage:** Tarayıcıda kalıcı küçük veri deposu. `setItem` / `getItem`. Sayfa yenilense de
   tema seçimi kayboluyorsa buraya bak. 🔎 *"localstorage javascript"*
5. **`prefers-color-scheme`:** Kullanıcının **işletim sistemi** teması. İlk açılışta buna uyuyoruz
   (Windows koyu moddaysa site de koyu açılır). 🔎 *"prefers-color-scheme media query"*
6. **FOUC (flash of unstyled content):** React yüklenene kadar yarım saniye beyaz ekran görünmesi.
   Çözüm: `index.html`'in `<head>`ine küçük bir script koyup temayı **React'ten önce** uygulamak.
7. **Kontrast / erişilebilirlik (a11y):** Koyu zeminde soluk gri yazı okunmaz. Yazı renklerini
   açtık (`bark-900` aydınlıkta koyu kahve → karanlıkta krem). 🔎 *"wcag contrast ratio"*
8. **`color-scheme: dark`:** Tarayıcının **kendi** parçalarını (kaydırma çubuğu, tarih seçici,
   `<select>` açılır listesi) da koyulaştırır. Bunu unutursan formlar beyaz parlar.

### 🐞 Dikkat ettiğimiz 3 tuzak
| Tuzak | Neden sorun? | Çözümümüz |
|---|---|---|
| Modal karartması `bg-bark-900/30` | `bark-900` karanlıkta **krem** olur → perde beyazlaşır | Ayrı `--color-overlay` değişkeni (her iki temada da koyu) |
| KPI kartı yazısı `text-cream-50` | Karanlıkta koyulaşır → gradyan üstünde kaybolur | Sabit `text-white` (gradyan zaten her iki temada koyu) |
| Grafik renkleri (Recharts) | CSS sınıfı değil, JS prop'u (`fill="#C2703F"`) → CSS değişkeni işlemez | `CHART.light` / `CHART.dark` nesnesi + `useTheme()` ile seçim |

### 🐞 Bonus hata: "Donut grafik boş çiziliyordu"
Renkleri kontrol ederken fark ettim: pasta grafiğin dilimleri **hiç görünmüyordu**. Tarayıcının
inceleme aracında baktığımda `<g class="recharts-pie-sector">` etiketleri vardı ama **içleri boştu**
(`<path>` hiç oluşmamıştı). Sebep: `recharts 3` + React **StrictMode** ikilisinde pasta grafiğin
giriş animasyonu yarıda kalıyor. Çözüm: `<Pie isAnimationActive={false} />`.

- **StrictMode nedir?** React'in geliştirme modunda bileşenleri **iki kez** çalıştırıp hata avlayan
  koruma kalkanı (`main.jsx`'te `<StrictMode>`). Bazı animasyon kütüphaneleri buna takılır. 🔎 *"react strictmode double render"*
- **Ders:** Bir şeyin "çalıştığını" sadece metin görerek doğrulama — **DOM'a bak**. Sayfa metni
  doğruydu ama grafik boştu; fark etmemiz ancak elemanları incelediğimizde oldu. 🔎 *"chrome devtools inspect element"*

### 🎤 Sunumda söyleyebileceğin cümle
> *"Karanlık modu, her bileşene ayrı ayrı stil yazarak değil, anlamsal CSS değişkenleri üzerinden
> kurguladım: tema değişince sadece değişkenlerin değerleri takas oluyor, tüm arayüz ve grafikler
> otomatik uyum sağlıyor. Seçim localStorage'da saklanıyor, ilk girişte ise işletim sisteminin
> tercihine uyuyor."*

---

## 📖 Oturum 8 — Toast Bildirimleri (Ekstra Özellik #3) 🔔 ✅

### Neler yaptık
Kullanıcı bir işlem yapınca sağ üstte beliren, kendiliğinden kaybolan bildirimler:
**"… faturası kaydedildi"**, **"… ödendi olarak işaretlendi"**, **"N fatura Excel'e aktarılıyor…"**,
hata olursa **"Faturalar yüklenemedi"**. Üst üste yığılıyor, altında süre çubuğu var, elle de kapanıyor.

### Çalışman gereken konular
1. **Neden `alert()` değil?** `alert()` sayfayı **dondurur** (kullanıcı tamam demeden hiçbir şey
   çalışmaz), tasarıma uymaz ve birden fazla mesaj gösteremez. Toast ise akışı kesmez. 🔎 *"toast notification ux"*
2. **Context ile "global" fonksiyon paylaşmak:** Tema gibi burada da Context kullandık — ama bu sefer
   paylaştığımız şey **veri değil, fonksiyon** (`toast.success(...)`). Böylece herhangi bir bileşen tek
   satırla bildirim gösterebiliyor. Aynı kalıp: `createContext` → `Provider` → `useContext`.
3. **`useCallback` / `useMemo`:** React her render'da fonksiyonları **yeniden üretir**. Bu yeni
   fonksiyonlar `useEffect` bağımlılıklarını tetikleyip sonsuz döngü yapabilir. `useMemo` ile `toast`
   nesnesini sabitledik. 🔎 *"react usememo usecallback ne zaman"*
4. **Dizi state'ini güncelleme (immutability):** `setToasts([...list, yeni])` ve
   `list.filter(t => t.id !== id)`. React'te diziyi **push ile değiştirmeyiz**, yenisini üretiriz. 🔎 *"react state array immutable update"*
5. **`setTimeout` ile otomatik kapanma:** 3.5 sn sonra kendini listeden siliyor.
6. **`key` prop'u ve `crypto.randomUUID()`:** Listede her elemanın benzersiz `key`'i olmalı, yoksa
   React hangi elemanın silindiğini karıştırır. 🔎 *"react key prop neden gerekli"*
7. **CSS animasyonları (`@keyframes`):** Girişte sağdan kayma (`toast-in`) + süre çubuğunun erimesi
   (`toast-bar`). Tailwind v4'te `@theme` içine `--animate-toast-in: ...` yazınca `animate-toast-in`
   sınıfı oluşuyor. 🔎 *"css keyframes animation"*
8. **`role="status"`:** Ekran okuyucular bildirimi sesli okusun diye erişilebilirlik etiketi. 🔎 *"aria live region role status"*

### 🎨 Tema uyumu
Toast renkleri **yeni renk uydurmadan**, mevcut durum değişkenlerinden geliyor:
başarı = `paid-bg/paid-tx`, hata = `overdue-bg/overdue-tx`, bilgi = `pending-bg/pending-tx`.
Bu yüzden karanlık modda **hiçbir ek iş yapmadan** uyumlu (Oturum 7'deki değişken mantığının meyvesi 🍎).

### 🎤 Sunumda söyleyebileceğin cümle
> *"Kullanıcı geri bildirimi için `alert()` yerine kendi toast sistemimi yazdım: Context üzerinden tüm
> uygulamadan tek satırla çağrılabiliyor, bildirimler yığılabiliyor ve 3.5 saniyede kendiliğinden
> kapanıyor. Renkleri mevcut durum paletinden aldığı için karanlık modda da otomatik uyumlu."*

---

## 📖 Oturum 9 — Fatura Dosyası Ekleme (Ekstra Özellik #4) 📎 ✅

### Neler yaptık
Her faturaya **dekont/PDF/görsel** yükleme. Bu, ekstralar arasında **backend'e de dokunan ilk özellik**:
yeni veritabanı sütunları + migration + 3 yeni endpoint + dosya kaydetme katmanı.

| Katman | Dosya | Görevi |
|---|---|---|
| Model | `app/models.py` | `attachment_name`, `attachment_path` sütunları |
| Depolama | `app/storage.py` **(yeni)** | Diske yazma, doğrulama, silme |
| CRUD | `app/crud.py` | `set_attachment`, `clear_attachment` |
| Router | `app/routers/invoices.py` | POST / GET / DELETE `/invoices/{id}/attachment` |
| Frontend | `components/AttachmentCell.jsx` **(yeni)** | Tablodaki 📎 sütunu |

### 💡 En önemli tasarım kararı: Dosya veritabanına konmaz!
Veritabanına dosyanın **kendisini** değil, sadece **nerede olduğunu** yazdık. Dosya
`backend/uploads/` klasöründe durur.
**Neden?** Veritabanı dosya deposu değildir: yedekler devasa olur, sorgular yavaşlar, bellek şişer.
Kurumsal sistemlerde dosyalar diskte veya bulutta (AWS S3 gibi) tutulur. 🔎 *"storing files in database vs filesystem"*

### 🔒 Güvenlik — dosya yükleme internetin en çok saldırı alan yeridir
| Önlem | Neden? |
|---|---|
| **Tür beyaz listesi** (sadece PDF/JPG/PNG/WEBP) | `.exe`, `.php` yüklenip sunucuda çalıştırılmasın |
| **Boyut sınırı** (5 MB) | Kötü niyetli biri diski doldurup sunucuyu çökertmesin |
| **Adı BİZ üretiyoruz** (`uuid4().hex`) | En kritiği ⚠️ Kullanıcının gönderdiği ad `../../.env` olabilir; onu yol olarak kullanırsak başka dosyaların üzerine yazılır → **path traversal** açığı |
| Orijinal ad ayrı sütunda | Kullanıcı yine "dekont.pdf" olarak indirir, ama disk güvende |
| `attachment_path` API'den **dönmüyor** | Dış dünya sunucu klasör yapısını bilmesin |

🔎 *"path traversal vulnerability"*, *"unrestricted file upload owasp"*

### Çalışman gereken konular
1. **Alembic migration akışı:** Model değişti → `alembic revision --autogenerate -m "..."` (Alembic
   modeli veritabanıyla karşılaştırıp farkı bulur) → dosyayı **oku/kontrol et** → `alembic upgrade head`.
   Sütun eklerken `nullable=True` olmalı, yoksa mevcut satırlar ne olacak? 🔎 *"alembic autogenerate"*
2. **`multipart/form-data`:** Dosya JSON'a sığmaz (JSON metindir). Tarayıcı dosyayı bu formatla gönderir.
   FastAPI'nin bunu okuyabilmesi için **`python-multipart`** paketi şart. 🔎 *"multipart form data nedir"*
3. **FastAPI'de `UploadFile` ve `async`:** `await file.read()` → içeriği bayt olarak alır.
4. **`FileResponse`:** Dosyayı `filename=` ile döndürünce tarayıcı **orijinal adıyla** indirir
   (`Content-Disposition` başlığı). 🔎 *"content-disposition attachment"*
5. **HTTP durum kodları:** Yasaklı tür → **400** (kullanıcı hatası), fatura yok → **404**. **500 değil**,
   çünkü sunucu bozuk değil. 🔎 *"http status codes 4xx vs 5xx"*
6. **Frontend `FormData`:** `form.append('file', file)` — axios Content-Type'ı otomatik ayarlar, elle yazma.
7. **`useRef` + gizli `<input type="file">`:** Tarayıcının çirkin dosya seçicisi stillendirilemez;
   gizleyip kendi butonumuzla `inputRef.current.click()` diyoruz. Çok yaygın React kalıbı. 🔎 *"react hidden file input useref"*
8. **Öksüz dosya (orphan file) sorunu:** Fatura silinince ekini de sildik; yeni dosya yüklenince eskisini
   sildik. Yoksa disk zamanla çöple dolar.
9. **`.gitignore`:** `backend/uploads/` git'e girmiyor — kod deposu dosya deposu değildir, ayrıca
   başkasının faturası repoya yüklenmemeli.

### 🧪 Test ettiklerimiz
`curl` ile: geçerli PDF ✅ · `.exe` → **400 + açıklayıcı mesaj** ✅ · olmayan fatura → **404** ✅ ·
indirme → orijinal ad + bayt bayt aynı ✅ · silme → diskten de gitti ✅
Arayüzden: yükleme ✅ · yasaklı türde **backend'in mesajı toast'ta** ✅ · kaldırma ✅

### 🎤 Sunumda söyleyebileceğin cümle
> *"Faturalara dekont ekleme özelliği yazdım. Dosyaları veritabanına değil diske kaydediyorum;
> veritabanında sadece referansı tutuluyor. Yükleme uç noktasında tür beyaz listesi ve boyut sınırı
> var, dosya adını da sunucu tarafında UUID ile ben üretiyorum — böylece path traversal saldırısı
> mümkün değil. Şema değişikliğini Alembic migration'ı ile yönettim."*

---

## 📖 Oturum 10 — Tekrarlayan Faturalar (Ekstra Özellik #5) 🔁 ✅

### Neler yaptık
Kira/abonelik gibi düzenli faturalar. Bir fatura **"Aylık / 3 Aylık / Yıllık"** işaretlenince
**serinin başı** olur; `POST /invoices/generate-recurring` yaklaşan dönemleri otomatik üretir.
Bu, ekstralar içinde **en çok "iş mantığı" (business logic)** barındıran özellik.

### 🧠 Veri modeli: seriyi nasıl temsil ettik?
İki sütun yetti:
| Sütun | Anlamı |
|---|---|
| `recurrence` | "Aylık"/"3 Aylık"/"Yıllık" — boşsa tek seferlik fatura |
| `recurrence_parent_id` | **Boş** → serinin başı (kullanıcının girdiği) · **Dolu** → sistemin ürettiği tekrar |

Bu, kendi kendine referans veren (**self-referencing**) bir foreign key: `invoices.id` → `invoices.id`.
🔎 *"self referencing foreign key"*

### ⭐ En önemli kavram: İDEMPOTENCY (aynı işlemi tekrar yapmak sonucu değiştirmemeli)
Butona 5 kez basınca 5 kat fatura çıkmamalı! Nasıl sağladık?
> Yeni fatura üretmeden önce **serideki en ileri tarihe** bakıyoruz (`MAX(due_date)`).
> O tarih zaten ufkun (bugün + 30 gün) ötesindeyse **hiçbir şey yapmıyoruz.**

Test ettik: 1. çalıştırma → üretti, 2. ve 3. çalıştırma → **0**. ✅
🔎 *"idempotency nedir"* — ödeme sistemlerinde de hayati bir kavram (aynı ödemenin 2 kez geçmemesi).

### 🐞 Yaptığım tasarım hatası ve düzeltmesi
İlk sürüm **geçmişe dönük** de fatura üretti: seri başı Mart 2026 olduğu için Nisan–Temmuz aylarını
"ödenmemiş borç" olarak yarattı (6 fatura, 144.000 ₺!). **Yanlış:** hiç oluşturulmamış geçmiş aylar
birdenbire borç olarak belirmemeli. **Düzeltme:** döngü geçmiş dönemleri **atlıyor** (sayaç ilerliyor
ama kayıt açılmıyor), sadece bugünden ileriye üretiyor.
> 💡 Ders: Bir algoritma "çalışıyor" olabilir ama **iş kuralı olarak yanlış** olabilir. Sonuçlara bak.

### 📅 Ay sonu tuzağı — `add_months()`
`ay + 1` diye **yazılamaz**: 31 Ocak + 1 ay = **31 Şubat**?! Öyle bir gün yok.
`calendar.monthrange()` ile o ayın kaç gün çektiğini bulup kırpıyoruz. Test ettik:
```
2026-01-31 +  1 ay = 2026-02-28   ✅
2026-03-31 +  1 ay = 2026-04-30   ✅
2024-01-31 +  1 ay = 2024-02-29   ✅ (artık yıl!)
2026-12-15 +  1 ay = 2027-01-15   ✅ (yıl atlama)
```
🔎 *"python calendar monthrange"*, *"artık yıl (leap year)"*

### 🔗 `ON DELETE SET NULL` — neden CASCADE değil?
Seri başı silinince çocukları da silinseydi (**CASCADE**), kesilmiş gerçek faturalar yok olurdu —
muhasebede **kabul edilemez**. Biz `SET NULL` seçtik: bağ kopar, faturalar durur. Test ettik ✅
🔎 *"on delete cascade vs set null"*

### Çalışman gereken konular
1. **Emniyet frenleri (guard):** `MAX_PER_SERIES` ve `MAX_STEPS` — bozuk veri sonsuz döngüye sokmasın.
2. **SQL `MAX()` / `func.max`:** SQLAlchemy'de toplama fonksiyonu kullanımı.
3. **`or_()`:** "Ya seri başı ya da çocuğu" koşulu (`WHERE id = X OR parent_id = X`).
4. **Route sırası (yine!):** `/invoices/generate-recurring`, `/invoices/{id}`'den **önce** tanımlanmalı.
5. **Alembic kısıt isimlendirme:** Autogenerate FK adını `None` bıraktı → `downgrade()` onu bulamazdı.
   Elle isim verdik (`fk_invoices_recurrence_parent`). **Migration dosyasını hep oku!** 🔎 *"alembic naming convention"*
6. **Boş string ≠ null:** Formdaki `""` seçeneğini backend'e `null` olarak gönderiyoruz, yoksa
   Pydantic "geçerli bir Recurrence değil" diye **422** döner.

### 🎤 Sunumda söyleyebileceğin cümle
> *"Kira ve abonelik gibi düzenli giderler için tekrarlayan fatura mekanizması yazdım. Seriyi kendi
> kendine referans veren bir foreign key ile modelledim. Üretim uç noktası **idempotent**: kaç kez
> çağrılırsa çağrılsın kopya oluşturmuyor, çünkü serinin en ileri tarihine bakıp karar veriyor.
> Ay sonu taşmalarını da (31 Ocak + 1 ay) ayrıca ele aldım."*

---

## 📖 Oturum 11 — Bütçe Uyarısı (Ekstra Özellik #6) 💰 ✅

### Neler yaptık
Her kategoriye **aylık bütçe limiti**. Harcama limite yaklaşınca sarı, aşınca kırmızı uyarı.
**Raporlar sayfası artık boş değil** — bütçe yönetim ekranı oldu.

| Katman | Dosya | Görevi |
|---|---|---|
| Model | `app/models.py` → `Budget` **(yeni tablo)** | kategori (UNIQUE) + aylık limit |
| CRUD | `app/crud.py` | `upsert_budget`, `get_budget_status` |
| Router | `app/routers/budgets.py` **(yeni)** | GET / PUT / DELETE `/budgets` |
| Frontend | `pages/Reports.jsx` **(yeni)**, `components/BudgetBar.jsx` **(yeni)** | yönetim + doluluk çubukları |

### 💡 Önemli tasarım kararı: "Harcanan"ı VERİTABANINDA TUTMADIK
`budgets` tablosunda sadece **limit** var. "Bu ay ne kadar harcandı" bilgisi her istekte
faturalardan **hesaplanıyor**.
**Neden?** Türetilebilen (hesaplanabilen) veriyi ayrıca saklarsan, fatura silindiğinde/değiştiğinde
o sayıyı güncellemeyi unutursun → **tutarsız veri**. Tek doğru kaynak (single source of truth)
faturalar olmalı. 🔎 *"denormalization vs single source of truth"*

### Çalışman gereken konular
1. **UPSERT kalıbı:** "Varsa güncelle, yoksa oluştur". Kullanıcı için tek bir "Kaydet" düğmesi;
   arkada `SELECT` → varsa `UPDATE`, yoksa `INSERT`. Bu yüzden POST değil **PUT** kullandık
   (PUT idempotenttir: aynı isteği 10 kez atsan sonuç aynı). 🔎 *"http put vs post idempotent"*
2. **UNIQUE kısıtı:** `category` sütunu unique → aynı kategoriye iki bütçe **veritabanı seviyesinde**
   imkânsız. Sadece koda güvenme, veritabanına da kural koy. 🔎 *"sql unique constraint"*
3. **`GROUP BY` + `SUM()`:** Kategori bazlı toplamı **tek sorguda** aldık (her kategori için ayrı
   sorgu atmak = "N+1 problemi"). 🔎 *"sql group by having"*, *"n+1 query problem"*
4. **Enum'u yol parametresinde kullanmak:** `category: schemas.Category` yazınca FastAPI hatalı
   kategoriyi otomatik **422** ile reddediyor — kendi if'ini yazmana gerek yok.
5. **URL kodlaması:** "Yazılım" gibi Türkçe karakterli değerler URL'e doğrudan konamaz;
   `encodeURIComponent` ile `Yaz%C4%B1l%C4%B1m` olur. 🔎 *"url encoding percent encoding"*
6. **Bileşeni paylaşmak:** `BudgetBar` hem panelde hem Raporlar'da kullanılıyor — bir kez yaz, iki
   yerde kullan (React'in en büyük faydası).

### 🐞 Bulduğumuz GERÇEK hata: `transition-all` + CSS değişkeni
Bütçe çubuklarında `transition-all` vardı (genişlik animasyonu için). Ama tema değiştirince
**çubuk rengi eski temada takılı kaldı** — değişken `#7A8B5A`'ya dönmüştü, çubuk hâlâ `#9DB47A`.

**Sebep:** Değeri bir `var()`'dan gelen bir özelliği `transition`'a sokarsan, tarayıcı (Chromium)
değişken değişince rengi yeniden hesaplamıyor.

**Çözüm:** `transition-all` → `transition-[width]` (zaten sadece genişliği animasyonlamak istiyorduk).
Aynı hatayı `index.css`'te `body`'de de bulduk (`transition: background-color`) ve kaldırdık.

> 📌 **KURAL:** Tema değişkenlerinden beslenen özellikleri **animasyonlama**.
> Bonus: `transition-all` zaten kötü bir alışkanlık — istemediğin özellikleri de animasyonlar,
> performansı düşürür. Neyi animasyonladığını **açıkça yaz**. 🔎 *"why avoid transition all css"*

### 🧪 Test ettiklerimiz
Üç durum da (İyi %59 · Uyarı %90 · Aşıldı %104) ✅ · UPSERT (tekrar PUT → kopya değil, güncelleme) ✅ ·
geçersiz kategori **422** ✅ · limit 0 / negatif **422** ✅ · DELETE **204**, tekrar DELETE **404** ✅ ·
arayüzde kaydetme + canlı uyarı güncellemesi ✅ · her iki temada renkler ✅

### 🎤 Sunumda söyleyebileceğin cümle
> *"Kategori bazlı aylık bütçe takibi ekledim. Bütçe tablosunda sadece limiti tutuyorum; harcamayı
> faturalardan tek bir GROUP BY sorgusuyla anlık hesaplıyorum — böylece veri tutarsızlığı riski yok.
> Kaydetme uç noktasını PUT/upsert olarak tasarladım, kategori benzersizliğini de veritabanı
> seviyesinde UNIQUE kısıtıyla garantiledim."*

---

<!-- Sonraki oturumların notları buraya eklenecek -->
