"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context data
type ApiStatusContextType = {
    apiEndpoint: string | null;
    setApiEndpoint: (url: string | null) => void;
};

// Create the context with a default value
const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

// Create a Provider component
export function ApiStatusProvider({ children }: { children: ReactNode }) {
    const [apiEndpoint, setApiEndpoint] = useState<string | null>(null);

    return (
        <ApiStatusContext.Provider value={{ apiEndpoint, setApiEndpoint }}>
            {children}
        </ApiStatusContext.Provider>
    );
}

// Create a custom hook for easy access to the context
export function useApiStatus() {
    const context = useContext(ApiStatusContext);
    if (context === undefined) {
        throw new Error("useApiStatus must be used within an ApiStatusProvider");
    }
    return context;
}