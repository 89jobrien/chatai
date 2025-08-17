"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatMessage from "@/components/chat/ChatMessage";
import DiffViewer from "./DiffViewer"; // Import the new component
import { applyPatch } from 'diff';

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface CanvasChatProps {
    canvasCode: string;
    setCanvasCode: (code: string) => void;
}

export default function CanvasChat({ canvasCode, setCanvasCode }: CanvasChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const [diff, setDiff] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const send = async () => {
        if (!prompt) return;

        const userMessage: Message = { role: "user", content: prompt };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setPrompt("");
        setDiff(null); // Clear previous diff

        try {
            const response = await fetch("http://127.0.0.1:8000/chat/diff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    ai_can_edit_canvas: true,
                    canvas_code: canvasCode,
                }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";

            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                accumulatedResponse += decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1].content = accumulatedResponse;
                    return updatedMessages;
                });
            }

            const diffStartMarker = "--- DIFF ---";
            const diffEndMarker = "--- END DIFF ---";
            if (accumulatedResponse.includes(diffStartMarker)) {
                const diffSection = accumulatedResponse.substring(
                    accumulatedResponse.indexOf(diffStartMarker) + diffStartMarker.length,
                    accumulatedResponse.indexOf(diffEndMarker)
                ).trim();
                setDiff(diffSection);
            }

        } catch (error) {
            console.error("Failed to fetch:", error);
            const errorMessage: Message = { role: "assistant", content: "Sorry, something went wrong." };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleApplyDiff = () => {
        if (diff) {
            const newCode = applyPatch(canvasCode, diff);
            if (typeof newCode === 'string') {
                setCanvasCode(newCode);
            } else {
                console.error("Failed to apply patch.");
            }
            setDiff(null);
        }
    };

    const handleRejectDiff = () => {
        setDiff(null);
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <ChatMessage key={index} message={{ role: message.role, content: message.content }} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </CardContent>
            {diff && (
                <div className="p-4 border-t bg-slate-50">
                    <h4 className="font-bold mb-2">Suggested Changes ✨</h4>
                    <DiffViewer diffText={diff} />
                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={handleApplyDiff} size="sm">Accept</Button>
                        <Button onClick={handleRejectDiff} size="sm" variant="outline">Reject</Button>
                    </div>
                </div>
            )}
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