import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { motion, Variants } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CodeBlock from "./CodeBlock";

type ChatMessageProps = {
    role: "user" | "assistant" | "system";
    content: string;
};

const getNodeText = (node: any): string => {
    if (!node || !node.children) return '';
    return node.children.map((child: any) => {
        if (child.type === 'text') return child.value;
        if (child.children) return getNodeText(child);
        return '';
    }).join('');
};

const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <motion.div
            variants={messageVariants}
            className={`flex items-start gap-4 mb-4 ${isUser ? "justify-end" : "justify-start"
                }`}
        >
            {!isUser && (
                <Avatar className="w-10 h-10 border">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
            )}

            <div
                className={`p-4 rounded-lg shadow-md text-left min-w-0 ${isUser
                    ? "chat-bubble-user bg-primary text-primary-foreground text-right"
                    : "chat-bubble-assistant bg-card text-card-foreground border"
                    }`}
            >
                <div className="text-md">
                    <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                const rawText = getNodeText(node);

                                return match ? (
                                    <CodeBlock rawCode={rawText.replace(/\n$/, "")}>
                                        {children}
                                    </CodeBlock>
                                ) : (
                                    <code className="bg-gray-500/20 px-1 py-0.5 rounded-sm font-mono">
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>

            {isUser && (
                <Avatar className="w-10 h-10 border">
                    <AvatarFallback>You</AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}