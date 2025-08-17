"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ApiStatusContextType = {
    apiEndpoint: string | null;
    setApiEndpoint: (url: string | null) => void;
};

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

export function ApiStatusProvider({ children }: { children: ReactNode }) {
    const [apiEndpoint, setApiEndpoint] = useState<string | null>(null);

    return (
        <ApiStatusContext.Provider value={{ apiEndpoint, setApiEndpoint }}>
            {children}
        </ApiStatusContext.Provider>
    );
}

export function useApiStatus() {
    const context = useContext(ApiStatusContext);
    if (context === undefined) {
        throw new Error("useApiStatus must be used within an ApiStatusProvider");
    }
    return context;
}