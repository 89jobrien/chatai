from pydantic import BaseModel, Field
from typing import List, Optional

class Message(BaseModel):
    """Represents a single message in the chat history."""
    role: str
    content: str

class ChatRequest(BaseModel):
    """Defines the structure of a chat request."""
    messages: List[Message]
    max_completion_tokens: int = Field(
        150, description="Max number of tokens for the completion."
    )

class ChatRequestWithCode(ChatRequest):
    """
    Extends ChatRequest to include the canvas code for diff generation.
    """
    canvas_code: str
    ai_can_edit_canvas: bool = False

class ChatResponse(BaseModel):
    """Defines the structure of a chat response."""
    role: str
    content: str
    context: Optional[List[str]] = None