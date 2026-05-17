import os
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

def init_firebase():
    if not firebase_admin._apps:
        cred_path = settings.FIREBASE_SERVICE_ACCOUNT_KEY
        
        if cred_path:
            # If the path is relative, ensure it's evaluated relative to the backend directory
            if not os.path.isabs(cred_path):
                # Assume the backend directory is the root
                backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                cred_path = os.path.join(backend_dir, cred_path)
                
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase initialized successfully with credentials from {cred_path}")
            else:
                print(f"Warning: Firebase credential file not found at {cred_path}. Attempting to use default credentials.")
                try:
                    firebase_admin.initialize_app()
                except Exception as e:
                    raise RuntimeError(f"Failed to initialize Firebase. Checked path {cred_path} but it didn't exist. Error: {e}")
        else:
            print("No FIREBASE_SERVICE_ACCOUNT_KEY provided. Attempting to use default credentials.")
            firebase_admin.initialize_app()

init_firebase()

def get_db():
    db = firestore.client()
    yield db