"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, MessageSquare, Bot, Code, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const components: { title: string; href: string; description: string, icon: React.ElementType }[] = [
    {
        title: "Vector Memory",
        href: "#",
        description: "Remembers key details from your conversation for context-aware responses.",
        icon: Bot,
    },
    {
        title: "Code Generation",
        href: "#",
        description: "Generates and displays code snippets with syntax highlighting.",
        icon: Code,
    },
    {
        title: "Secure Backend",
        href: "#",
        description: "Powered by a robust FastAPI and Azure OpenAI backend.",
        icon: Lock,
    },
];

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="container mx-auto flex h-16 items-center justify-between">
                {/* Left Side: Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    <span className="font-bold">ChatAI</span>
                </Link>

                {/* Center: Navigation */}
                <div className="hidden md:flex">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                        {components.map((component) => (
                                            <ListItem
                                                key={component.title}
                                                title={component.title}
                                                href={component.href}
                                                icon={component.icon}
                                            >
                                                {component.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="#" className={navigationMenuTriggerStyle()}>
                                        Documentation
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right Side: GitHub Button */}
                <div>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </motion.nav>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon: React.ElementType }
>(({ className, title, children, icon: Icon, href, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    href={href!}
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";