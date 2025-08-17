"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ApiStatusIndicator from "./ApiStatusIndicator";

export default function Footer() {
    return (
        <motion.footer
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="border-t"
        >
            <div className="container sticky mx-auto flex h-16 max-w-3xl items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Built by{" "}
                    <Link
                        href="https://github.com/89jobrien"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        Joseph O'Brien
                    </Link>
                    .
                </p>
                <ApiStatusIndicator />
            </div>
        </motion.footer>
    );
}