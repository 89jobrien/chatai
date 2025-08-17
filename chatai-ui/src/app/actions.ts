// "use server";

// import { createUIMessageStream } from "ai";
// import { ModelMessage } from "ai";

// export async function continueConversation(
//   messages: ModelMessage[],
//   canvasCode: string
// ) {
//   const textStream = createUIMessageStream();

//   (async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/chat/diff", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           messages,
//           canvas_code: canvasCode,
//           ai_can_edit_canvas: true,
//         }),
//       });

//       if (!response.body) {
//         throw new Error("The response body is empty.");
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) {
//           break;
//         }
//         const decodedChunk = decoder.decode(value, { stream: true });
//         textStream.append(decodedChunk);
//       }
//     } catch (error) {
//       console.error("Error streaming data from backend:", error);
//       textStream.append("Error: Could not connect to the backend service.");
//     } finally {
//       textStream.done();
//     }
//   })();

//   return {
//     text: textStream.value,
//   };
// }
