"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CodeBlock from "./CodeBlock";
import { memo } from "react";
import { Message } from "@/types";

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({ message }) => {
    const { role, content } = message;
    const isModel = role === "assistant";

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
                {content.split("```").map((part, index) => {
                    if (index % 2 === 1) {
                        const language = part.split('\n')[0];
                        const code = part.substring(language.length + 1);
                        return <CodeBlock key={index} language={language} code={code} />;
                    } else {
                        return <p key={index} className="whitespace-pre-wrap">{part}</p>;
                    }
                })}
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