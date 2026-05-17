import os
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

def init_firebase():
    if not firebase_admin._apps:
        if settings.FIREBASE_PROJECT_ID and settings.FIREBASE_PRIVATE_KEY and settings.FIREBASE_CLIENT_EMAIL:
            # Construct credential dict from env vars
            cred_dict = {
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                # Replace literal \n with actual newlines for the private key
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": settings.FIREBASE_AUTH_URI,
                "token_uri": settings.FIREBASE_TOKEN_URI,
                "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL,
            }
            try:
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase initialized successfully with credentials from environment variables.")
            except Exception as e:
                raise RuntimeError(f"Failed to initialize Firebase using env variables. Error: {e}")
        else:
            print("Warning: Incomplete Firebase credentials in .env. Attempting to use default credentials.")
            try:
                firebase_admin.initialize_app()
            except Exception as e:
                raise RuntimeError(f"Failed to initialize Firebase with default credentials. Error: {e}")

init_firebase()

def get_db():
    db = firestore.client()
    yield db