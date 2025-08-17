import React from 'react';
import { parseDiff, Diff, Hunk } from 'react-diff-view';
import 'react-diff-view/style/index.css';

interface DiffViewerProps {
    diffText: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diffText }) => {
    const files = parseDiff(diffText);

    if (!files || files.length === 0) {
        return <div className="p-4 text-muted-foreground">No changes detected.</div>;
    }

    return (
        <div className="diff-viewer-container rounded-md border bg-white">
            {files.map((file, index) => (
                <Diff
                    key={index}
                    viewType="unified"
                    diffType={file.type}
                    hunks={file.hunks}
                >
                    {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
                </Diff>
            ))}
        </div>
    );
};

export default DiffViewer;