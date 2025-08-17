"use client";

import { useState } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import CanvasChat from "@/components/canvas/CanvasChat";
import CanvasPanel from "@/components/canvas/CanvasPanel";

export default function CanvasPage() {
    const [canvasCode, setCanvasCode] = useState(
        "function helloWorld() {\n  console.log('Hello, world!');\n}"
    );
    const [aiCanEdit, setAiCanEdit] = useState(true);
    const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false);

    const handleToggleCanvas = () => {
        setIsCanvasCollapsed(!isCanvasCollapsed);
    };

    return (
        <main className="flex-1 flex flex-col h-full">
            <ResizablePanelGroup
                direction="horizontal"
                className="flex-1"
                onLayout={(sizes: number[]) => {
                    if (sizes[0] === 0) {
                        setIsCanvasCollapsed(true);
                    } else {
                        setIsCanvasCollapsed(false);
                    }
                }}
            >
                <ResizablePanel
                    defaultSize={50}
                    collapsible={true}
                    minSize={20}
                    onCollapse={() => setIsCanvasCollapsed(true)}
                    onExpand={() => setIsCanvasCollapsed(false)}
                >
                    <CanvasPanel
                        canvasContent={canvasCode}
                        onCanvasChange={setCanvasCode}
                        aiCanEditCanvas={aiCanEdit}
                        onAiCanEditChange={setAiCanEdit}
                        onToggle={handleToggleCanvas}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    <CanvasChat canvasCode={canvasCode} setCanvasCode={setCanvasCode} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    );
}