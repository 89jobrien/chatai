import os
import requests
from typing import List, Optional

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")

if not all([AZURE_ENDPOINT, API_KEY, DEPLOYMENT]):
    raise RuntimeError(
        "Missing AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, "
        "or AZURE_OPENAI_DEPLOYMENT_NAME environment variables"
    )

# -----------------------------
# Vector Store for Chat Memory
# -----------------------------

class VectorStore:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """Initializes the vector store with an embedding model."""
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = faiss.IndexFlatL2(self.dimension)
        self.texts = []
        print("✅ Vector store initialized.")

    def add(self, text: str):
        """Adds text to the vector store."""
        embedding = self.model.encode([text])
        self.index.add(embedding)  # type: ignore
        self.texts.append(text)

    def search(self, query: str, k: int = 3) -> List[str]:
        """Searches for k-most similar texts to the query."""
        if self.index.ntotal == 0:
            return []
        
        # Ensure k is not greater than the number of items in the index
        k = min(k, self.index.ntotal)

        query_embedding = self.model.encode([query])
        _, indices = self.index.search(query_embedding, k)  # type: ignore
        
        # Return the corresponding texts for the found indices
        return [self.texts[i] for i in indices[0] if i != -1]

# Create a single, in-memory instance of our vector store
# This will reset every time the server restarts
memory = VectorStore()

# Initialize FastAPI app
app = FastAPI(title="Chatbot API (FastAPI + Azure OpenAI)")

# CORS middleware (adjust origins for production use)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Pydantic models
# -----------------------------

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    max_completion_tokens: Optional[int] = 16384


class ChatResponse(BaseModel):
    id: str
    content: str


# -----------------------------
# Routes
# -----------------------------

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    Handle chat requests with memory augmentation.
    """
    url = (
        f"{AZURE_ENDPOINT}/openai/deployments/{DEPLOYMENT}/chat/completions"
        f"?api-version={API_VERSION}"
    )
    headers = {"api-key": API_KEY, "Content-Type": "application/json"}

    # 1. Search for relevant memories
    user_query = req.messages[-1].content
    memories = memory.search(user_query, k=3)

    # 2. Augment the system prompt with memories
    system_prompt = "You are a helpful coding assistant. If the task involves writing code, your output should only contain markdown code blocks—no explanatory text, comments, or prose outside of the code blocks."
    if memories:
        memory_context = "\n".join(memories)
        system_prompt += (
            "\n\nHere is some relevant context from the conversation history:"
            f"\n---\n{memory_context}\n---"
        )
    
    # Prepare messages for OpenAI, replacing the original system message
    openai_messages = [{"role": "system", "content": system_prompt}]
    # Add all non-system messages from the request
    openai_messages.extend([m.model_dump() for m in req.messages if m.role != "system"])

    payload = {
        "messages": openai_messages,
        "max_completion_tokens": req.max_completion_tokens,
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=60)

    if resp.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Azure OpenAI error: {resp.status_code} - {resp.text}"
        )

    data = resp.json()

    try:
        assistant_response = data["choices"][0]["message"]["content"]
    except Exception:
        raise HTTPException(
            status_code=500, detail=f"Unexpected response format: {data}"
        )

    # 3. Add the current exchange to memory for future reference
    memory.add(f"User: {user_query}")
    memory.add(f"Assistant: {assistant_response}")

    return {"id": data.get("id", ""), "content": assistant_response}


@app.get("/")
def root():
    return {"status": "ok"}