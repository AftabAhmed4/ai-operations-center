import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str = None
    FIREBASE_PROJECT_ID: str = None
    FIREBASE_PRIVATE_KEY_ID: str = None
    FIREBASE_PRIVATE_KEY: str = None
    FIREBASE_CLIENT_EMAIL: str = None
    FIREBASE_CLIENT_ID: str = None
    FIREBASE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    FIREBASE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: str = "https://www.googleapis.com/oauth2/v1/certs"
    FIREBASE_CLIENT_X509_CERT_URL: str = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
