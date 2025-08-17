import os
from dotenv import load_dotenv

load_dotenv()

# --- Azure OpenAI Configuration ---
API_KEY = os.getenv("AZURE_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
API_VERSION = os.getenv("AZURE_API_VERSION")
AZURE_DEPLOYMENT = os.getenv("AZURE_LLM")
AZURE_EMBEDDER = os.getenv("AZURE_EMBEDDER")

# --- ChromaDB Configuration ---
CHROMA_DB_PATH = "./chroma_db"
CHROMA_COLLECTION = "chat_memory"

# --- CORS Configuration ---
CORS_ORIGINS = [
    "http://localhost:3000",
    # Add your production frontend URL here
]