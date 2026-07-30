"""
env.py — Alembic'in her çalıştığında okuduğu ayar dosyası.

Alembic'e iki şeyi öğretiyoruz:
  1) Veritabanı adresini nereden alacağını  -> .env içindeki settings.database_url
  2) Hangi tabloları takip edeceğini         -> app.models içindeki modeller
Böylece "alembic revision --autogenerate" modellerimize bakıp SQL'i kendisi yazar.
"""
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# backend/ klasörünü Python yoluna ekle ki "app" paketini import edebilelim
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings          # .env'den okunan ayarlar
from app.database import Base            # tabloların taban sınıfı
import app.models  # noqa: F401          # tabloların metadata'ya kaydolması için (ŞART!)

# Alembic'in ana yapılandırma nesnesi (alembic.ini'yi temsil eder)
config = context.config

# Loglama ayarlarını uygula
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Veritabanı adresini .env'den alıp Alembic'e ver
config.set_main_option("sqlalchemy.url", settings.database_url)

# Autogenerate'in karşılaştıracağı hedef şema = bizim tüm tablolarımız
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Bağlantı kurmadan sadece SQL üretir (nadiren kullanılır)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Veritabanına bağlanıp migration'ları uygular (normal kullanım)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
