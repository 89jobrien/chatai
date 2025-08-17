"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiStatusIndicator from '@/components/utility/ApiStatusIndicator';
import { apiUrl } from '@/constants/util';

type Message = {
    role: "user" | "assistant" | "system";
    content: string;
};

interface ChatPanelProps {
    messages: Message[];
    input: string;
    loading: boolean;
    isCanvasCollapsed: boolean;
    onToggleCanvas: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSend: () => void;
    bottomRef: React.RefObject<HTMLDivElement | null>;
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
    messages,
    input,
    loading,
    isCanvasCollapsed,
    onToggleCanvas,
    onInputChange,
    onKeyDown,
    onSend,
    bottomRef,
}) => {
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
            {/* FIX: Add overflow-hidden to constrain the child element */}
            <CardContent className="flex-grow flex flex-col overflow-hidden">
                {/* FIX: Remove h-full to allow flexbox to correctly calculate height */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="border rounded-md overflow-y-auto p-4 flex-grow"
                >
                    {messages
                        .filter((m) => m.role !== 'system')
                        .map((m, idx) => (
                            <ChatMessage
                                key={idx}
                                role={m.role}
                                content={m.content.split('\n---\n\nUser Message:\n---\n')[1] || m.content}
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
                    <div ref={bottomRef} />
                </motion.div>
                <div className="flex gap-2 mt-4 flex-shrink-0">
                    <Input
                        value={input}
                        onChange={onInputChange}
                        onKeyDown={onKeyDown}
                        placeholder="Type your message and press Enter..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button onClick={onSend} disabled={loading}>
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