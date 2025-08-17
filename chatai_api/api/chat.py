import logging
import difflib
import json
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
    # This function remains unchanged
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
    Handles code modification requests by streaming newline-delimited JSON objects.
    One object for the conversational text, and another for the diff UI component.
    """
    if not req.ai_can_edit_canvas:
        return await chat(req)

    try:
        last_user_message = req.messages[-1].content
        logger.info(f"Received code modification request: '{last_user_message}'")

        # Get the new code and conversational response
        new_code = await llm.get_code_suggestion(last_user_message, req.canvas_code)
        context = await vector_store.search(last_user_message)
        chat_response_text = await llm.get_chat_completion(req, tuple(context))

        # Generate the diff
        diff_str = "".join(difflib.unified_diff(
            req.canvas_code.splitlines(keepends=True),
            new_code.splitlines(keepends=True),
            fromfile='original',
            tofile='new',
        ))

        async def stream_generator():
            # 1. Stream the conversational text payload
            text_payload = json.dumps({"type": "text", "payload": chat_response_text})
            yield f"{text_payload}\n"
            
            # 2. Stream the diff payload for the UI component
            if diff_str:
                diff_payload = json.dumps({"type": "diff", "payload": diff_str})
                yield f"{diff_payload}\n"

            # Add to memory after streaming is complete
            await vector_store.add(last_user_message)
            await vector_store.add(chat_response_text)

        # Use the application/x-ndjson media type for newline-delimited JSON
        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")

    except Exception as e:
        logger.error(f"An error occurred during code modification: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during the code modification process.")