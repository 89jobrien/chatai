import uuid
from typing import List
import chromadb
from openai import AsyncAzureOpenAI
from core import config

class VectorStore:
    """Manages the ChromaDB vector store for chat memory."""

    def __init__(self, db_path: str = config.CHROMA_DB_PATH):
        """Initializes a persistent ChromaDB vector store."""
        self.aclient = AsyncAzureOpenAI(
            api_key=config.API_KEY,
            api_version=config.API_VERSION,
            azure_endpoint=str(config.AZURE_ENDPOINT),
        )
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(config.CHROMA_COLLECTION)
        print("✅ Vector store initialized.")

    async def _get_embedding(self, text: str) -> List[float]:
        """Generates embedding for a given text using Azure OpenAI."""
        response = await self.aclient.embeddings.create(
            input=text, model=str(config.AZURE_EMBEDDER)
        )
        return response.data[0].embedding

    async def add(self, text: str):
        """Adds text to the vector store with a unique ID."""
        embedding = await self._get_embedding(text)
        self.collection.add(
            ids=[str(uuid.uuid4())],
            embeddings=[embedding],
            documents=[text]
        )
        print(f"📚 Added to memory: '{text}'")

    async def search(self, query_text: str, n_results: int = 3) -> List[str]:
        """Searches for similar texts in the vector store."""
        if self.collection.count() == 0:
            return []

        query_embedding = await self._get_embedding(query_text)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results['documents'][0] if results['documents'] else []