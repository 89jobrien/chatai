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
