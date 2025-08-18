"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatMessage from "@/components/chat/ChatMessage";
import { apiUrl } from "@/constants/util";
import { Message } from "@/types";

export default function Home() {
    const [history, setHistory] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const send = async () => {
        if (!prompt) return;

        const userMessage: Message = { id: Date.now().toString(), role: "user", content: prompt };
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

            setHistory((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "" }]);

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
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, something went wrong.",
            };
            setHistory((prev) => [...prev, errorMessage]);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <Card className="w-full max-w-2xl flex flex-col h-[80vh]">
                <CardHeader>
                    <CardTitle>Chat to Me</CardTitle>
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
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                        />
                        <Button onClick={send}>Send</Button>
                    </div>
                </div>
            </Card>
        </main>
    );
}
