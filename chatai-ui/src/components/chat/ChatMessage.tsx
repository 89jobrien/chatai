// chatai-ui/src/components/chat/ChatMessage.tsx

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CodeBlock from "./CodeBlock";

interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const { role, parts } = message;
    const isModel = role === "model";

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
                {parts.map((part, index) => {
                    const codeMatch = part.text.match(/```(\w+)?\n([\s\S]+?)```/);
                    if (codeMatch) {
                        const language = codeMatch[1] || "plaintext";
                        const code = codeMatch[2];
                        return <CodeBlock key={index} language={language} code={code} />;
                    }
                    return (
                        <p key={index} className="whitespace-pre-wrap">
                            {part.text}
                        </p>
                    );
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
}