import { NextResponse } from "next/server";
import { UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const canvasCode = body.data?.canvasCode;

    const endpoint = canvasCode
      ? "http://127.0.0.1:8000/chat/diff"
      : "http://127.0.0.1:8000/chat";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((msg: UIMessage) => ({
          ...msg,
          content: msg.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join(""),
        })),
        canvas_code: canvasCode,
        ai_can_edit_canvas: !!canvasCode,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return new NextResponse(errorText, { status: response.status });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "application/x-ndjson",
      },
    });
  } catch (error) {
    console.error("Error in Next.js API route:", error);
    return new NextResponse("An error occurred in the Next.js API route.", {
      status: 500,
    });
  }
}
