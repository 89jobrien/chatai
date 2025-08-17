# import difflib
# from ai.tool import tool
# from chatai_api.core import llm
# from pydantic import BaseModel, Field

# class DiffInput(BaseModel):
#     prompt: str = Field(..., description="The user's request for code changes.")
#     code: str = Field(..., description="The current code from the canvas.")

# @tool
# async def applyCodeDiff(input: DiffInput) -> str:
#     """
#     Generates a diff of the user's code based on their request.
#     This tool should be used when the user asks to modify, refactor,
#     or change the code on the canvas.
#     """
#     new_code = await llm.get_code_suggestion(input.prompt, input.code)
    
#     diff = difflib.unified_diff(
#         input.code.splitlines(keepends=True),
#         new_code.splitlines(keepends=True),
#         fromfile='original',
#         tofile='new',
#     )
    
#     return "".join(diff)