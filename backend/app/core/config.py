import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "nexusforge")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    @property
    def DATABASE_URL(self) -> str:
        # Using aiomysql for async SQLAlchemy with MySQL
        if self.DB_PASSWORD:
            return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return f"mysql+aiomysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"

settings = Settings()
