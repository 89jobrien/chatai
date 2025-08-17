import httpx
from functools import lru_cache
from typing import Tuple
from openai import AsyncAzureOpenAI
from openai.types.chat import (
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionAssistantMessageParam,
)
from core.config import settings
from core.models import ChatRequest

def to_openai_message(msg):
    """Converts a message to the format expected by the OpenAI API."""
    if msg["role"] == "system":
        return ChatCompletionSystemMessageParam(**msg)
    elif msg["role"] == "user":
        return ChatCompletionUserMessageParam(**msg)
    elif msg["role"] == "assistant":
        return ChatCompletionAssistantMessageParam(**msg)
    else:
        raise ValueError(f"Unknown role: {msg['role']}")

@lru_cache(maxsize=128)
async def get_chat_completion(req: ChatRequest, context: Tuple[str, ...]) -> str:
    """Gets a chat completion from Azure OpenAI."""
    system_prompt = (
        "You are a helpful AI assistant. "
        "Use the following context from our past conversation to answer the user's question. "
        "If the context is not relevant, ignore it.\n\n"
        f"Context:\n- {'\n- '.join(context)}"
    )

    openai_messages = [to_openai_message({"role": "system", "content": system_prompt})] + [
        to_openai_message(msg.model_dump()) for msg in req.messages
    ]

    async with httpx.AsyncClient(verify=False) as client:
        chat_client = AsyncAzureOpenAI(
            api_key=settings.AZURE_API_KEY,
            api_version=settings.AZURE_API_VERSION,
            azure_endpoint=str(settings.AZURE_ENDPOINT),
            http_client=client,
        )

        response = await chat_client.chat.completions.create(
            model=str(settings.AZURE_LLM),
            messages=openai_messages,
            max_completion_tokens=req.max_completion_tokens,
        )

    return str(response.choices[0].message.content)

@lru_cache(maxsize=128)
async def get_code_suggestion(prompt: str, code: str) -> str:
    """Gets a code suggestion from Azure OpenAI based on a prompt and existing code."""
    generation_prompt = (
        "You are an expert programmer. Based on the following code and the user's request, "
        "generate the complete, new version of the code. "
        "If no changes or optimizations are needed, simply return the original code. "
        "Do not add any conversational text, explanations, or pleasantries—only the raw code.\n\n"
        f"--- CODE ---\n{code}\n--- END CODE ---\n\n"
        f"--- REQUEST ---\n{prompt}\n--- END REQUEST ---"
    )

    async with httpx.AsyncClient(verify=False) as client:
        chat_client = AsyncAzureOpenAI(
            api_key=settings.AZURE_API_KEY,
            api_version=settings.AZURE_API_VERSION,
            azure_endpoint=str(settings.AZURE_ENDPOINT),
            http_client=client,
        )
        
        response = await chat_client.chat.completions.create(
            model=str(settings.AZURE_LLM),
            messages=[{"role": "user", "content": generation_prompt}],
            max_completion_tokens=2048,
        )
    
    # CORRECTED: Add a fallback to the original code if the model returns an empty response
    generated_code = str(response.choices[0].message.content)
    if not generated_code or generated_code.isspace():
        return code
    return generated_code