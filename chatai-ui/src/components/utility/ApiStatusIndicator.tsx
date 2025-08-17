"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApiStatus } from "@/context/ApiStatusContext";

export default function ApiStatusIndicator() {
    const { apiEndpoint } = useApiStatus();

    return (
        <AnimatePresence>
            {apiEndpoint && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        className="h-2 w-2 rounded-full bg-green-500"
                    />
                    <span>Pinging: {apiEndpoint}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}