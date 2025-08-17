"use client";

import React, { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CodeBlock from "./CodeBlock";

interface Message {
    role: "user" | "model" | "assistant" | "system";
    content: string;
}

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({ message }) => {
    const { role, content } = message;
    const isModel = role === "model" || role === "assistant";
    const displayContent = content.split('\n---\n\nUser Message:\n---\n')[1] || content;

    return (
        <div className={`flex items-start gap-4 ${isModel ? "" : "justify-end"}`}>
            {isModel && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" />
                    <AvatarFallback>B</AvatarFallback>
                </Avatar>
            )}
            <div
                className={`rounded-lg p-3 max-w-[85%] ${isModel ? "bg-muted" : "bg-primary text-primary-foreground"
                    }`}
            >
                {(() => {
                    const codeMatch = displayContent.match(/```(\w+)?\n([\s\S]+?)```/);
                    if (codeMatch) {
                        const language = codeMatch[1] || "plaintext";
                        const code = codeMatch[2];
                        return <CodeBlock language={language} code={code} />;
                    }
                    return <p className="whitespace-pre-wrap">{displayContent}</p>;
                })()}
            </div>
            {!isModel && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;