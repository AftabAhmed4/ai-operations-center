import os
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    CLOUD_SQL_CONNECTION_NAME: str
    GEMINI_API_KEY: str

    @property
    def DATABASE_URL(self) -> str:
        # Encode user and password separately
        user = quote_plus(self.DB_USER)
        password = quote_plus(self.DB_PASSWORD)
        return f"mysql+aiomysql://{user}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
