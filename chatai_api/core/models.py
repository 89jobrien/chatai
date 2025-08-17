from pydantic import BaseModel, Field
from typing import List, Optional
from core.config import settings

class Message(BaseModel):
    """Represents a single message in the chat history."""
    role: str
    content: str

    model_config = {
        "frozen": True
    }

    def __hash__(self):
        return hash((self.role, self.content))

class ChatRequest(BaseModel):
    """Defines the structure of a chat request."""
    messages: List[Message]
    max_completion_tokens: int = Field(
        settings.MAX_COMPLETION_TOKENS, description="Max number of tokens for the completion."
    )

    model_config = {
        "frozen": True
    }

    def __hash__(self):
        return hash((tuple(self.messages), self.max_completion_tokens))

class ChatRequestWithCode(ChatRequest):
    """
    Extends ChatRequest to include the canvas code for diff generation.
    """
    canvas_code: str
    ai_can_edit_canvas: bool = False

    model_config = {
        "frozen": True
    }

    def __hash__(self):
        return hash((
            super().__hash__(), 
            self.canvas_code, 
            self.ai_can_edit_canvas
        ))

class ChatResponse(BaseModel):
    """Defines the structure of a chat response."""
    role: str
    content: str
    context: Optional[List[str]] = None
