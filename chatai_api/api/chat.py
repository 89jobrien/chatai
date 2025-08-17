import logging
import difflib
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from core import llm
from core.models import ChatRequest, ChatResponse, ChatRequestWithCode
from core.vector_store import VectorStore

# Configure logging
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
    Handles chat requests that can modify code, generating a diff.
    """
    if not req.ai_can_edit_canvas:
        return await chat(req)

    try:
        last_user_message = req.messages[-1].content
        logger.info(f"Received diff request. User message: '{last_user_message}'")
        logger.info(f"Original canvas code:\n---\n{req.canvas_code}\n---")

        # 1. Generate new code from the language model
        new_code = await llm.get_code_suggestion(last_user_message, req.canvas_code)
        logger.info(f"Generated new code:\n---\n{new_code}\n---")
        
        # 2. Create a diff
        diff = difflib.unified_diff(
            req.canvas_code.splitlines(keepends=True),
            new_code.splitlines(keepends=True),
            fromfile='original',
            tofile='new',
        )
        diff_str = "".join(diff)
        logger.info(f"Generated diff:\n---\n{diff_str}\n---")

        # 3. Get a standard chat response for the conversational part
        context = await vector_store.search(last_user_message)
        chat_response_text = await llm.get_chat_completion(req, tuple(context))

        async def stream_generator():
            if diff_str:
                yield f"--- DIFF ---\n{diff_str}\n--- END DIFF ---\n"
            yield chat_response_text

        return StreamingResponse(stream_generator(), media_type="text/plain")

    except Exception as e:
        # This will now log the full error traceback to your console
        logger.error(f"An error occurred during diff generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during the diff process.")