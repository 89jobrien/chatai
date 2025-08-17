import difflib
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from core import llm
from core.models import ChatRequest, ChatResponse, ChatRequestWithCode
from core.vector_store import VectorStore

chat_router = APIRouter()
vector_store = VectorStore()


@chat_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Handles chat requests with memory augmentation."""
    try:
        last_user_message = req.messages[-1].content
        context = await vector_store.search(last_user_message)
        assistant_response = await llm.get_chat_completion(req, context)
        await vector_store.add(last_user_message)
        await vector_store.add(assistant_response)
        return ChatResponse(role="assistant", content=assistant_response, context=context)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during the chat process.")

    
@chat_router.post("/chat/diff")
async def chat_diff(req: ChatRequestWithCode):
    """
    Handles chat requests that can modify code, generating a diff.
    """
    if not req.ai_can_edit_canvas:
        # Fallback to regular chat if canvas editing is disabled
        return await chat(req)

    try:
        # 1. Generate new code based on the canvas and prompt
        new_code = await llm.get_code_suggestion(req.messages[-1].content, req.canvas_code)
        
        # 2. Create a diff
        diff = difflib.unified_diff(
            req.canvas_code.splitlines(keepends=True),
            new_code.splitlines(keepends=True),
            fromfile='original',
            tofile='new',
        )
        diff_str = "".join(diff)

        # 3. Get a standard chat response for the conversational part
        context = await vector_store.search(req.messages[-1].content)
        chat_response_text = await llm.get_chat_completion(req, context)

        async def stream_generator():
            if diff_str:
                yield f"--- DIFF ---\n{diff_str}\n--- END DIFF ---\n"
            yield chat_response_text

        return StreamingResponse(stream_generator(), media_type="text/plain")

    except Exception as e:
        print(f"An error occurred in diff generation: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during the diff process.")