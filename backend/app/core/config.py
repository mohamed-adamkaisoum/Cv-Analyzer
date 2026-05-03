from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "change-me-to-a-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = f"sqlite:///{Path(__file__).resolve().parents[1] / 'app.db'}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
