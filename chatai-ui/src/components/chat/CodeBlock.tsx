"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
    language: string;
    code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-md my-2">
            <div className="flex items-center justify-between px-4 py-1 bg-gray-700 rounded-t-md">
                <span className="text-sm text-gray-300">{language}</span>
                <Button onClick={handleCopy} variant="ghost" size="sm" className="text-white">
                    {isCopied ? "Copied!" : "Copy"}
                </Button>
            </div>
            <pre className="p-4 text-sm text-white overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
}