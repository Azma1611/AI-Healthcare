from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from api.config import settings
import logging

logger = logging.getLogger(__name__)

# Support for PostgreSQL or fallback to SQLite
# If using SQLite, we need to add connect_args={"check_same_thread": False}
db_url = settings.get_database_url()

if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url, connect_args={"check_same_thread": False}, pool_pre_ping=True
    )
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
