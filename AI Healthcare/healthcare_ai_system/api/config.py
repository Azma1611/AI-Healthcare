from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # API Settings
    api_title: str = "AI Healthcare Diagnosis API"
    environment: str = "development"
    
    # Security Settings
    jwt_secret_key: str = "super_secret_dev_key_never_use_in_prod"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.environment.lower() == "production" and self.jwt_secret_key == "super_secret_dev_key_never_use_in_prod":
            raise ValueError("Insecure JWT secret key detected in production environment! Please set JWT_SECRET_KEY in .env")
            
    # CORS
    cors_origins: List[str] = ["*"]
    
    # Rate Limiting (Dev friendly defaults)
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    
    # Limits
    max_upload_size_bytes: int = 2 * 1024 * 1024
    
    # Logging
    log_level: str = "INFO"
    
    # Database
    db_host: str | None = None
    db_port: int | None = None
    db_user: str | None = None
    db_password: str | None = None
    db_name: str | None = None
    database_url: str = "sqlite:///./healthcare.db"
    
    def get_database_url(self) -> str:
        if self.db_host and self.db_user and self.db_name:
            return f"mysql+mysqlconnector://{self.db_user}:{self.db_password or ''}@{self.db_host}:{self.db_port or 3306}/{self.db_name}"
        return self.database_url
    
    # Cache
    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env")

# Global settings instance
settings = Settings()
