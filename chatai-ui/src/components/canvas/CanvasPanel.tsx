"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import { ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const highlight = (code: string) => Prism.highlight(code, Prism.languages.javascript, 'javascript');

interface CanvasPanelProps {
    canvasContent: string;
    aiCanEditCanvas: boolean;
    onCanvasChange: (code: string) => void;
    onAiCanEditChange: (checked: boolean) => void;
    onToggle: () => void;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({
    canvasContent,
    aiCanEditCanvas,
    onCanvasChange,
    onAiCanEditChange,
    onToggle,
}) => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Collaborative Canvas</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onToggle}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            {/* FIX: Add overflow-hidden to constrain the child element */}
            <CardContent className="flex-grow flex flex-col overflow-hidden">
                {/* FIX: Remove h-full to allow flexbox to correctly calculate height */}
                <div className="border rounded-md overflow-y-auto w-full bg-[#2d2d2d] flex-grow">
                    <Editor
                        value={canvasContent}
                        onValueChange={onCanvasChange}
                        highlight={highlight}
                        padding={10}
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            outline: 'none',
                            border: 'none',
                            // FIX: Ensure editor takes full height of its container
                            minHeight: '100%',
                        }}
                    />
                </div>
                <div className="flex items-center space-x-2 mt-2 flex-shrink-0">
                    <Checkbox
                        id="ai-edit-panel"
                        checked={aiCanEditCanvas}
                        onCheckedChange={(checked) => onAiCanEditChange(!!checked)}
                    />
                    <Label htmlFor="ai-edit-panel">Allow AI to edit canvas</Label>
                </div>
            </CardContent>
        </Card>
    );
};

export default CanvasPanel;