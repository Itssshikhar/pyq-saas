import os
from dotenv import load_dotenv
import libsql_experimental as libsql
from fastapi import Depends
import contextlib

# Load environment variables
load_dotenv()

# Get database configuration from environment variables
TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")

if not TURSO_DATABASE_URL:
    raise ValueError("TURSO_DATABASE_URL environment variable is not set")
if not TURSO_AUTH_TOKEN:
    raise ValueError("TURSO_AUTH_TOKEN environment variable is not set")

# Create a global connection pool
_connection = None

def get_connection():
    """
    Get or create a database connection.
    """
    global _connection
    if _connection is None:
        _connection = libsql.connect(TURSO_DATABASE_URL, auth_token=TURSO_AUTH_TOKEN)
    return _connection

async def get_db():
    """
    Returns a database client.
    This will be used as a FastAPI dependency.
    """
    conn = get_connection()
    try:
        yield conn
    except Exception as e:
        # If there's a connection error, clear the global connection
        global _connection
        _connection = None
        raise e 