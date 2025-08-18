import httpx
from async_lru import alru_cache
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

@alru_cache(maxsize=128)
async def get_chat_completion(req: ChatRequest, context: Tuple[str, ...]) -> str:
    """Gets a chat completion from Azure OpenAI."""
    # This function remains cached as it's more likely to have repeated requests.
    system_prompt = (
        "You are a helpful AI assistant. "
        "Use the following context from our past conversation to answer the user's question. "
        "If the context is not relevant, ignore it.\n\n"
        f"Context:\n- {'\n- '.join(context)}"
    )
    openai_messages = [to_openai_message({"role": "system", "content": system_prompt})] + [
        to_openai_message(msg.model_dump()) for msg in req.messages
    ]
    async with httpx.AsyncClient(verify=False, timeout=60.0) as client:
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


async def get_code_suggestion(prompt: str, code: str) -> str:
    """
    Gets a code suggestion from Azure OpenAI based on a prompt and existing code.
    """
    system_prompt = (
        "You are an expert programmer AI. Your task is to help the user with their code. "
        "Based on the user's request, provide the complete, updated code in a single markdown code block. "
        "If no changes are necessary, explain that and still provide the original code in a block."
    )
    
    final_prompt = (
        f"{prompt}\n\n"
        "Here is the code I am working on:\n"
        f"```python\n{code}\n```"
    )
    
    openai_messages = [
        to_openai_message({"role": "system", "content": system_prompt}),
        to_openai_message({"role": "user", "content": final_prompt})
    ]

    async with httpx.AsyncClient(verify=False, timeout=60.0) as client:
        chat_client = AsyncAzureOpenAI(
            api_key=settings.AZURE_API_KEY,
            api_version=settings.AZURE_API_VERSION,
            azure_endpoint=str(settings.AZURE_ENDPOINT),
            http_client=client,
        )
        
        response = await chat_client.chat.completions.create(
            model=str(settings.AZURE_LLM),
            messages=openai_messages,
            max_completion_tokens=settings.MAX_COMPLETION_TOKENS,
        )
        
    return str(response.choices[0].message.content)