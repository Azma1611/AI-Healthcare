import pytest
import os
import shutil
from sqlalchemy.orm import sessionmaker

# Use a file-based SQLite database for tests to avoid in-memory multi-engine issues
TEST_DB_FILE = "./test_healthcare.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_FILE}"

from api.database import Base, get_db, engine
from api.main import app
from api import models
from api.auth import hash_password

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_test_db():
    # Drop and recreate tables for each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Seed mock users
    with TestingSessionLocal() as db:
        if db.query(models.User).count() == 0:
            dr_smith = models.User(username="dr_smith", hashed_password=hash_password("secure_password_123"), role="clinician")
            admin_user = models.User(username="admin_user", hashed_password=hash_password("admin_password_456"), role="admin")
            db.add(dr_smith)
            db.add(admin_user)
            db.commit()
            
    yield
    
    # Cleanup after tests
    Base.metadata.drop_all(bind=engine)
