import { Message } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Calls the backend to get a streaming response for code modification.
 * @param messages The history of messages.
 * @param canvasCode The current code on the canvas.
 * @returns A ReadableStream from the backend.
 */
export const streamDiffResponse = async (
  messages: Message[],
  canvasCode: string
): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_BASE_URL}/chat/diff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      canvas_code: canvasCode,
      ai_can_edit_canvas: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error("The response body is empty.");
  }

  return response.body;
};

export const streamChatResponse = async (
  messages: Message[]
): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error("The response body is empty.");
  }

  return response.body;
};
