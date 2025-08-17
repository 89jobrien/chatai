"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

type CodeBlockProps = {
    children?: React.ReactNode;
    rawCode: string;
};

export default function CodeBlock({ children, rawCode }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(rawCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800/50 dark:bg-gray-900/50 rounded-lg my-4 overflow-hidden">
            <div className="flex justify-end items-center px-4 py-2 bg-gray-700/50 dark:bg-gray-800/50">
                <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                    {copied ? (
                        <>
                            <Check size={14} /> Copied!
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-lg overflow-x-auto font-mono">
                <code>{children}</code>
            </pre>
        </div>
    );
}