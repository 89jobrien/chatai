# chatai_api/llm.py

from openai import AsyncAzureOpenAI
from openai.types.chat import (
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionAssistantMessageParam,
)
from core import config
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

async def get_chat_completion(req: ChatRequest, context: list[str]) -> str:
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

    chat_client = AsyncAzureOpenAI(
        api_key=config.API_KEY,
        api_version=config.API_VERSION,
        azure_endpoint=str(config.AZURE_ENDPOINT),
    )

    response = await chat_client.chat.completions.create(
        model=str(config.AZURE_DEPLOYMENT),
        messages=openai_messages,
        max_tokens=req.max_completion_tokens,
    )

    return str(response.choices[0].message.content)

async def get_code_suggestion(prompt: str, code: str) -> str:
    """Gets a code suggestion from Azure OpenAI based on a prompt and existing code."""
    generation_prompt = (
        "You are an expert programmer. Based on the following code and the user's request, "
        "generate the complete, new version of the code. Do not add any conversational text or pleasantries, "
        "only the raw code.\n\n"
        f"--- CODE ---\n{code}\n--- END CODE ---\n\n"
        f"--- REQUEST ---\n{prompt}\n--- END REQUEST ---"
    )

    chat_client = AsyncAzureOpenAI(
        api_key=config.API_KEY,
        api_version=config.API_VERSION,
        azure_endpoint=str(config.AZURE_ENDPOINT),
    )
    
    response = await chat_client.chat.completions.create(
        model=str(config.AZURE_DEPLOYMENT),
        messages=[{"role": "user", "content": generation_prompt}],
        max_tokens=2048, # Increased token limit for code generation
    )
    
    return str(response.choices[0].message.content)