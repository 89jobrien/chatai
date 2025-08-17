"use client"

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ChatMessage from "@/components/chat/ChatMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiStatus } from "@/context/ApiStatusContext";
import { apiUrl } from "@/constants/util";
import ApiStatusIndicator from "@/components/utility/ApiStatusIndicator";


type Message = {
    role: "user" | "assistant" | "system";
    content: string;
};

const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function Chatbot() {
    const { setApiEndpoint } = useApiStatus();
    const [messages, setMessages] = useState<Message[]>([
        { role: "system", content: "You are a helpful assistant." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const send = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMsg: Message = { role: "user", content: trimmed };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput("");
        setLoading(true);
        const endpoint = `${apiUrl}/chat`;
        setApiEndpoint(endpoint);

        try {
            const payload = {
                messages: newMessages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                temperature: 0.7,
                max_tokens: 16384,
            };

            const res = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed: ${res.status}`);
            }

            const data = await res.json();
            const assistantMsg: Message = {
                role: "assistant",
                content: data.content,
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err: any) {
            const errMsg = err?.message ?? "Unknown error";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${errMsg}` },
            ]);
        } finally {
            setLoading(false);
            setApiEndpoint(null);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="container min-h-screen flex items-center justify-center p-1">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                        ChatAI
                    </CardTitle>
                    <ApiStatusIndicator />
                </CardHeader>
                <CardContent>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="border rounded-md h-[60vh] overflow-y-auto p-4"
                    >
                        {messages
                            .filter((m) => m.role !== "system")
                            .map((m, idx) => (
                                <ChatMessage key={idx} role={m.role} content={m.content} />
                            ))}

                        {loading && (
                            <motion.div // Animate the typing indicator
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="text-muted-foreground italic"
                            >
                                Assistant is typing...
                            </motion.div>
                        )}

                        <div ref={bottomRef} />
                    </motion.div>

                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Type your message and press Enter..."
                            className="flex-1"
                            disabled={loading}
                        />
                        <Button
                            onClick={send}
                            disabled={loading}
                        >
                            Send
                        </Button>
                    </div>

                    <div className="mt-3 text-med text-muted-foreground">
                        Backend: {apiUrl} | Model via Azure deployment
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}