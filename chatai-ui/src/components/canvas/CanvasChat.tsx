"use client"

import React, { useState, useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
// import 'prismjs/components/prism-clike';
// import 'prismjs/components/prism-javascript';
// import 'prismjs/components/prism-typescript';
// import 'prismjs/components/prism-python';
// import 'prismjs/components/prism-css';
// import 'prismjs/components/prism-markup';

import { useApiStatus } from "@/context/ApiStatusContext";
import { apiUrl } from "@/constants/util";
import CanvasPanel from '@/components/canvas/CanvasPanel';
import ChatPanel from '@/components/canvas/ChatPanel';

type Message = {
    role: "user" | "assistant" | "system";
    content: string;
};

export default function CanvasChat() {
    const { setApiEndpoint } = useApiStatus();
    const [messages, setMessages] = useState<Message[]>([
        { role: "system", content: "You are a helpful assistant. You can edit the canvas if the user allows it." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [canvasContent, setCanvasContent] = useState("function helloWorld() {\n  console.log('Hello, world!');\n}");
    const [userHasEditedCanvas, setUserHasEditedCanvas] = useState(false);
    const [aiCanEditCanvas, setAiCanEditCanvas] = useState(false);
    const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false);

    const canvasPanelRef = useRef<ImperativePanelHandle>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleCanvasChange = (code: string) => {
        setCanvasContent(code);
        setUserHasEditedCanvas(true);
    };

    const toggleCanvas = () => {
        const panel = canvasPanelRef.current;
        if (panel) {
            if (isCanvasCollapsed) {
                panel.expand();
            } else {
                panel.collapse();
            }
        }
    };

    const send = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        let prompt = trimmed;
        if (userHasEditedCanvas && canvasContent.trim()) {
            prompt = `Canvas Content:\n---\n${canvasContent}\n---\n\nUser Message:\n---\n${trimmed}`;
        }

        const userMsg: Message = { role: "user", content: prompt };
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
                ai_can_edit_canvas: aiCanEditCanvas,
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

            if (aiCanEditCanvas && data.canvas_content) {
                setCanvasContent(data.canvas_content);
                setUserHasEditedCanvas(false);
            }

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
        <div className="container py-4 h-[calc(100vh-5rem)]">
            <PanelGroup direction="horizontal" className="w-full h-full">
                <Panel
                    ref={canvasPanelRef}
                    defaultSize={50}
                    minSize={25}
                    collapsible={true}
                    onCollapse={() => setIsCanvasCollapsed(true)}
                    onExpand={() => setIsCanvasCollapsed(false)}
                    className="transition-all duration-300 ease-in-out"
                >
                    <CanvasPanel
                        canvasContent={canvasContent}
                        aiCanEditCanvas={aiCanEditCanvas}
                        onCanvasChange={handleCanvasChange}
                        onAiCanEditChange={setAiCanEditCanvas}
                        onToggle={toggleCanvas}
                    />
                </Panel>
                <PanelResizeHandle className="w-4 flex items-center justify-center">
                    <div className="w-1 h-10 bg-border rounded-full" />
                </PanelResizeHandle>
                <Panel defaultSize={50} minSize={25}>
                    <ChatPanel
                        messages={messages}
                        input={input}
                        loading={loading}
                        isCanvasCollapsed={isCanvasCollapsed}
                        onToggleCanvas={toggleCanvas}
                        onInputChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        onSend={send}
                        bottomRef={bottomRef}
                    />
                </Panel>
            </PanelGroup>
        </div>
    );
}