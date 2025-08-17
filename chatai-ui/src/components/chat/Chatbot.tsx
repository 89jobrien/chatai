"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatMessage from "@/components/chat/ChatMessage";
import { apiUrl } from "@/constants/util";

// CORRECTED: Message interface now uses 'content'
interface Message {
    role: "user" | "model" | "assistant" | "system";
    content: string;
}

export default function Chatbot() {
    const [history, setHistory] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const send = async () => {
        if (!prompt) return;

        // CORRECTED: User message now uses 'content'
        const userMessage: Message = { role: "user", content: prompt };
        setHistory((prev) => [...prev, userMessage]);
        setPrompt("");

        try {
            const response = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...history, userMessage] }),
            });

            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";

            setHistory((prev) => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulatedResponse += decoder.decode(value, { stream: true });
                setHistory((prev) => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].content = accumulatedResponse;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error("Failed to fetch:", error);
            const errorMessage: Message = { role: "assistant", content: "Sorry, something went wrong." };
            setHistory((prev) => [...prev, errorMessage]);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto flex flex-col h-[80vh]">
            <CardHeader>
                <CardTitle>Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                <div className="space-y-4">
                    {history.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </CardContent>
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