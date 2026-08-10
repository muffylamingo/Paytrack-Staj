# ============================================================================
#  PayTrack Frontend — React + Vite
#
#  İKİ AŞAMALI (multi-stage) DERLEME:
#    1. AŞAMA: Node ile projeyi derle (npm install + build)
#    2. AŞAMA: Sadece çıkan statik dosyaları nginx'e koy
#
#  Neden? Node ve node_modules ~400 MB. Ama tarayıcının ihtiyacı olan şey
#  sadece derlenmiş HTML/CSS/JS. İkinci aşamaya yalnızca onları taşıyınca
#  imaj ~50 MB'a düşüyor. 🔎 "docker multi-stage build"
# ============================================================================

# ---------- 1. AŞAMA: derleme ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Önce sadece paket dosyaları -> kod değişince npm install tekrar çalışmaz (önbellek)
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build          # çıktı: /app/dist

# ---------- 2. AŞAMA: sunma ----------
FROM nginx:alpine

# Derlenmiş dosyaları nginx'in yayın klasörüne kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Tek sayfa uygulaması (SPA) ayarı
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
