import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Load environment variables from a .env file if it exists
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Azure OpenAI Configuration ---
    AZURE_API_KEY: str
    AZURE_ENDPOINT: str
    AZURE_API_VERSION: str
    AZURE_LLM: str
    AZURE_EMBEDDER: str

    # --- ChromaDB Configuration ---
    CHROMA_DB_PATH: str = "./chroma_db"
    CHROMA_COLLECTION: str = "chat_memory"

    # --- CORS Configuration ---
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # --- OpenAI Configuration ---
    MAX_COMPLETION_TOKENS: int = 16384

settings = Settings(
    AZURE_API_KEY=str(os.getenv("AZURE_API_KEY")),
    AZURE_ENDPOINT=str(os.getenv("AZURE_ENDPOINT")),
    AZURE_API_VERSION=str(os.getenv("AZURE_API_VERSION")),
    AZURE_LLM=str(os.getenv("AZURE_LLM")),
    AZURE_EMBEDDER=str(os.getenv("AZURE_EMBEDDER")),
)