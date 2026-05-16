import os
from sqlalchemy.engine.url import URL
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Pydantic will look for these keys in your .env file automatically
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    GEMINI_API_KEY: str

    @property
    def DATABASE_URL(self) -> str:
        # This builds the URL correctly even if your password has '@' or '#'
        return URL.create(
            drivername="mysql+aiomysql",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME
        ).render_as_string(hide_password=False)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
