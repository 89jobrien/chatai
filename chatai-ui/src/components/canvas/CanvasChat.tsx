"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiffViewer from "./DiffViewer";
import { applyPatch } from 'diff';
import { useChat, UIMessage } from '@ai-sdk/react';
import { UIMessageComponent } from "../chat/UIMessage";


interface CanvasChatProps {
    canvasCode: string;
    setCanvasCode: (code: string) => void;
}

export default function CanvasChat({ canvasCode, setCanvasCode }: CanvasChatProps) {
    const { messages, sendMessage } = useChat();
    const [prompt, setPrompt] = useState("");

    const handleApplyDiff = (diff: string) => {
        const newCode = applyPatch(canvasCode, diff);
        if (typeof newCode === 'string') {
            setCanvasCode(newCode);
        } else {
            console.error("Failed to apply patch.");
        }
    };

    const send = () => {
        if (!prompt) return;

        sendMessage(
            { role: 'user', parts: [{ type: 'text', text: prompt }] },
            {
                body: {
                    canvasCode: canvasCode,
                }
            }
        );

        setPrompt("");
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <UIMessageComponent key={index} message={message} />
                    ))}
                </div>
            </CardContent>
            {/* The diff viewer is now handled by the UIMessageComponent */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your message here."
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    />
                    <Button onClick={send}>Send</Button>
                </div>
            </div>
        </Card>
    );
}

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import DiffViewer from "./DiffViewer";
// import { applyPatch } from 'diff';
// import { Message } from "@/types";
// import ChatMessage from "../chat/ChatMessage";
// import { streamDiffResponse } from "@/services/apiCaller";
// import ApiStatusIndicator from "../utility/ApiStatusIndicator";

// interface CanvasChatProps {
//     canvasCode: string;
//     setCanvasCode: (code: string) => void;
// }

// export default function CanvasChat({ canvasCode, setCanvasCode }: CanvasChatProps) {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [prompt, setPrompt] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [diff, setDiff] = useState<string | null>(null);

//     const messagesEndRef = useRef<HTMLDivElement>(null);
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);


//     const handleApplyDiff = () => {
//         if (diff) {
//             const newCode = applyPatch(canvasCode, diff);
//             if (typeof newCode === 'string') {
//                 setCanvasCode(newCode);
//             } else {
//                 console.error("Failed to apply patch.");
//             }
//             setDiff(null);
//         }
//     };

//     const handleRejectDiff = () => {
//         setDiff(null);
//     };

//     const send = async () => {
//         if (!prompt || isLoading) return;

//         setIsLoading(true);
//         setDiff(null);

//         const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
//         const newMessages = [...messages, userMessage];
//         setMessages(newMessages);
//         setPrompt("");

//         try {
//             const stream = await streamDiffResponse(newMessages, canvasCode);
//             const reader = stream.getReader();
//             const decoder = new TextDecoder();
//             let buffer = '';

//             const assistantMessageId = Date.now().toString();
//             setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

//             while (true) {
//                 const { done, value } = await reader.read();
//                 if (done) break;

//                 buffer += decoder.decode(value, { stream: true });
//                 const lines = buffer.split('\n');
//                 buffer = lines.pop() || ''; // Keep incomplete line in buffer

//                 for (const line of lines) {
//                     if (line.trim() === '') continue;
//                     try {
//                         const data = JSON.parse(line);
//                         if (data.type === 'text') {
//                             setMessages(prev => prev.map(msg =>
//                                 msg.id === assistantMessageId ? { ...msg, content: data.payload } : msg
//                             ));
//                         } else if (data.type === 'diff') {
//                             setDiff(data.payload);
//                         }
//                     } catch (e) {
//                         console.error("Failed to parse JSON from stream:", line, e);
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error("Failed to fetch:", error);
//             const errorId = Date.now().toString();
//             const errorMessage: Message = { id: errorId, role: 'assistant', content: "Sorry, something went wrong." };
//             setMessages(prev => prev.map(msg => msg.content === '' ? errorMessage : msg));
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <Card className="flex flex-col h-full">
//             <CardHeader>
//                 <CardTitle>
//                     Chat
//                 </CardTitle>
//                 <ApiStatusIndicator />
//             </CardHeader>
//             <CardContent className="flex-grow overflow-y-auto">
//                 <div className="space-y-4">
//                     {messages.map((message, index) => (
//                         <ChatMessage key={index} message={message} />
//                     ))}
//                     {isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
//                         <div className="text-muted-foreground italic">Assistant is thinking...</div>
//                     )}
//                 </div>
//                 <div ref={messagesEndRef} />
//             </CardContent>
//             {diff && (
//                 <div className="p-4 border-t bg-slate-50">
//                     <h4 className="font-bold mb-2">Suggested Changes ✨</h4>
//                     <DiffViewer diffText={diff} />
//                     <div className="flex justify-end gap-2 mt-2">
//                         <Button onClick={handleApplyDiff} size="sm">Accept</Button>
//                         <Button onClick={handleRejectDiff} size="sm" variant="outline">Reject</Button>
//                     </div>
//                 </div>
//             )}
//             <div className="p-4 border-t">
//                 <div className="flex gap-2">
//                     <Textarea
//                         value={prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                         placeholder="Type your message here."
//                         disabled={isLoading}
//                         onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
//                     />
//                     <Button onClick={send} disabled={isLoading}>Send</Button>
//                 </div>
//             </div>
//         </Card>
//     );
// }

