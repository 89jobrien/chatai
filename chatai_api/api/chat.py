import httpx
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from core import llm
from core.models import ChatRequest, ChatResponse, ChatRequestWithCode
from core.vector_store import VectorStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chat_router = APIRouter()
vector_store = VectorStore()

@chat_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Handles chat requests with memory augmentation."""
    try:
        last_user_message = req.messages[-1].content
        context = await vector_store.search(last_user_message)
        
        assistant_response = await llm.get_chat_completion(req, tuple(context))

        await vector_store.add(last_user_message)
        await vector_store.add(assistant_response)
        return ChatResponse(role="assistant", content=assistant_response, context=context)
    except Exception as e:
        logger.error(f"An error occurred during chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during the chat process.")

@chat_router.post("/chat/diff")
async def chat_diff(req: ChatRequestWithCode):
    """
    Handles chat requests that can modify code, returning a stream with the
    explanation and the new code block.
    """
    if not req.ai_can_edit_canvas:
        return await chat(req)

    try:
        last_user_message = req.messages[-1].content
        logger.info(f"Received code modification request: '{last_user_message}'")

        message_dicts = tuple(msg.model_dump() for msg in req.messages)

        stream = await llm.get_code_modification_chat(
            prompt=last_user_message,
            code=req.canvas_code,
            messages=message_dicts
        )

        async def stream_generator():
            full_response = ""
            try:
                async for chunk in stream:
                    if chunk.choices:
                        content = chunk.choices[0].delta.content or ""
                        full_response += content
                        yield content
            except httpx.ReadError:
                logger.warning("Stream ended unexpectedly with a ReadError. Continuing with the response collected so far.")
            
            await vector_store.add(last_user_message)
            await vector_store.add(full_response)


        return StreamingResponse(stream_generator(), media_type="text/plain")

    except Exception as e:
        logger.error(f"An error occurred during code modification: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during the code modification process.")