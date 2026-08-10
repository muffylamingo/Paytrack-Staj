# ============================================================================
#  PayTrack Backend — FastAPI
#  "slim" imaj: tam Python imajından çok daha küçük, bize yeten her şeye sahip.
# ============================================================================
FROM python:3.12-slim

# Python davranışı:
#   PYTHONDONTWRITEBYTECODE -> .pyc dosyaları üretme (konteynerde gereksiz)
#   PYTHONUNBUFFERED        -> log'lar anında görünsün (yoksa tamponlanır)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ÖNCE sadece requirements'ı kopyalıyoruz.
# Neden? Docker her adımı önbelleğe alır. Kod değişince bu adım yeniden
# çalışmaz ve paketler tekrar indirilmez -> imaj çok daha hızlı derlenir.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sonra uygulama kodu
COPY . .

# Yüklenen dekontların yeri (docker-compose'da kalıcı volume bağlanıyor)
RUN mkdir -p /app/uploads

EXPOSE 8000

# Başlangıç betiği: veritabanını bekler, migration'ları çalıştırır, sunucuyu açar
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
