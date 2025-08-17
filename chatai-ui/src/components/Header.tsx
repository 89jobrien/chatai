"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Header() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="container mx-auto flex h-16 max-w-3xl items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    <span className="font-bold text-left">ChatAI</span>
                </Link>
                <Button asChild>
                    <Link href="https://github.com/89jobrien/chatai-ui" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </Link>
                </Button>
            </div>
        </motion.header>
    );
}