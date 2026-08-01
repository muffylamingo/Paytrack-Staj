# 🚀 PayTrack — Başlatma & Durdurma Komutları

> Her oturumda projeyi çalıştırmak için bu adımları izle. 3 parça var:
> **1) Veritabanı (Docker)** · **2) Backend (FastAPI)** · **3) Frontend (React)**
> Backend ve Frontend için **ayrı terminaller** kullan ve açık bırak.

---

## ▶️ BAŞLATMA (sırayla)

### 1) Docker Desktop'ı aç
Başlat menüsünden **Docker Desktop**'ı çalıştır. Sağ alttaki balina ikonu sabitlenene kadar bekle.

### 2) Veritabanı + Keycloak'ı başlat  *(yeni terminal)*
```bash
cd C:\Users\hp\Desktop\stajprje
```
```bash
docker compose up -d
```
Kontrol: `docker compose ps` → **`paytrack_db`** ve **`paytrack_keycloak`** ikisi de `Up` olmalı.

> ⏳ Keycloak ilk açılışta **1-2 dakika** sürebilir. Hazır olduğunu şuradan anlarsın:
> http://localhost:8080/realms/paytrack/.well-known/openid-configuration (JSON dönerse hazır)

### 3) Backend'i başlat  *(yeni terminal — açık bırak)*
```bash
cd C:\Users\hp\Desktop\stajprje\backend
```
```bash
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
`Application startup complete` görünce **terminale dokunma.** → API: http://localhost:8000/docs

### 4) Frontend'i başlat  *(BAŞKA bir yeni terminal — açık bırak)*
```bash
cd C:\Users\hp\Desktop\stajprje\frontend
```
```bash
npm run dev
```
`Local: http://localhost:5173` görünce **terminali açık bırak.** → Uygulama: http://localhost:5173

> ⚠️ Komutları **tek tek** çalıştır (iki satırı birlikte yapıştırma). Başladıktan sonra o terminale dokunma.

### 5) Giriş yap
Uygulamayı açınca otomatik olarak **Keycloak giriş ekranına** yönlenirsin.

| Kullanıcı | Şifre | Kim |
|---|---|---|
| `stajyer` | `paytrack123` | ODAKENT Stajyer |
| `mudur` | `paytrack123` | Finans Müdürü |

> Bu kullanıcılar `keycloak/paytrack-realm.json` içinde tanımlı ve Keycloak her açıldığında
> otomatik kuruluyor. Keycloak yönetim paneli: http://localhost:8080 (`admin` / `admin`)
>
> 🔐 Bunlar **yerel geliştirme** şifreleridir. Gerçek bir kurulumda asla böyle basit
> şifreler ve dosyada duran kullanıcılar kullanılmaz.

---

## ⏹️ DURDURMA

| Ne | Nasıl |
|----|-------|
| **Backend** | Çalıştığı terminale git → **Ctrl + C** |
| **Frontend** | Çalıştığı terminale git → **Ctrl + C** |
| **Veritabanı** *(opsiyonel)* | `cd C:\Users\hp\Desktop\stajprje` sonra `docker compose stop` |

Docker'ı durdursan bile **verilerin kaybolmaz**; `docker compose up -d` ile geri gelir.
İstersen Docker Desktop uygulamasını da kapatabilirsin.

---

## ⚠️ Docker'da DİKKAT
- `docker compose stop` → durdurur, **veri durur** ✅
- `docker compose down` → container silinir ama **veri (volume) durur** ✅
- `docker compose down -v` → **VERİYİ DE SİLER** ❌ (faturaların gider — sakın yapma!)

---

## 🔎 Faydalı kontrol komutları
```bash
docker compose ps
```
```bash
docker exec -it paytrack_db psql -U paytrack -d paytrack -c "\dt"
```
