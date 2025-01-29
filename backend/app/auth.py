import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
print(f"Credential path: {cred_path}")  # Debug print

if not cred_path:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set")

if not os.path.exists(cred_path):
    raise ValueError(f"Firebase credentials file not found at: {cred_path}")

@lru_cache()
def get_firebase_app():
    try:
        return firebase_admin.get_app()
    except ValueError:
        return firebase_admin.initialize_app(
            credentials.Certificate(cred_path)
        )

# Initialize Firebase Admin app
get_firebase_app()

# Security scheme
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase ID token and return user ID
    """
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) 