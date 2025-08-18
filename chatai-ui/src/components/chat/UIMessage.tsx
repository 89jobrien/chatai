"use client";

import { UIMessage } from "@ai-sdk/react";
import DiffViewer from "../canvas/DiffViewer";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UIMessageProps {
    message: UIMessage;
}

export const UIMessageComponent: React.FC<UIMessageProps> = ({ message }) => {
    const { role, parts } = message;
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
                {parts.map((part, index) => {
                    if (part.type === 'text') {
                        return <p key={index} className="whitespace-pre-wrap">{part.text}</p>;
                    }
                    if (part.type.startsWith('tool-') && part.type.includes('applyCodeDiff')) {
                        if ('output' in part && typeof part.output === 'string') {
                            return <DiffViewer key={index} diffText={part.output} />;
                        }
                    }
                    return null;
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
};