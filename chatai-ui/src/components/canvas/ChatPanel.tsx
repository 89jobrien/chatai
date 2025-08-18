"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiStatusIndicator from '@/components/utility/ApiStatusIndicator';
import { apiUrl } from '@/constants/util';
import { Message } from "@/types";

interface ChatPanelProps {
    isCanvasCollapsed: boolean;
    onToggleCanvas: () => void;
}

const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const ChatPanel: React.FC<ChatPanelProps> = ({
    isCanvasCollapsed,
    onToggleCanvas,
}) => {
    const [history, setHistory] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const send = async () => {
        if (!prompt || loading) return;

        setLoading(true);
        const userMessage: Message = { id: Date.now().toString(), role: "user", content: prompt };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setPrompt("");

        try {
            const response = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newHistory }),
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
                    const updatedHistory = [...prev];
                    updatedHistory[updatedHistory.length - 1].content = accumulatedResponse;
                    return updatedHistory;
                });
            }
        } catch (error) {
            console.error("Failed to fetch:", error);
            const errorMessage: Message = { id: Date.now().toString(), role: "assistant", content: "Sorry, something went wrong." };
            setHistory((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    {isCanvasCollapsed && (
                        <Button variant="ghost" size="icon" onClick={onToggleCanvas}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    )}
                    <CardTitle className="text-2xl font-semibold">
                        ChatAI
                    </CardTitle>
                </div>
                <ApiStatusIndicator />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="border rounded-md overflow-y-auto p-4 flex-grow"
                >
                    {history.map((m, idx) => (
                        <ChatMessage
                            key={idx}
                            message={m}
                        />
                    ))}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-muted-foreground italic"
                        >
                            Assistant is typing...
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </motion.div>
                <div className="flex gap-2 mt-4 flex-shrink-0">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Type your message and press Enter..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button onClick={send} disabled={loading}>
                        Send
                    </Button>
                </div>
                <div className="mt-3 text-med text-muted-foreground flex-shrink-0">
                    Backend: {apiUrl} | Model via Azure deployment
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatPanel;