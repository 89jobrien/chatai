// "use client";

// import { streamUI } from 'ai/rsc';
// import { useState } from 'react';
// import DiffViewer from './DiffViewer';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';


// export function GenerativeDiff({ prompt, code }: { prompt: string; code: string }) {
//     const [generation, setGeneration] = useState<string>('');
//     const [ui, setUi] = useState<React.ReactNode | null>(null);

//     const generateDiff = async () => {
//         const { ui } = await streamUI({
//             model: openai('gpt-4'),
//             prompt,
//             text: ({ content }) => {
//                 setGeneration(content);
//                 return <DiffViewer diffText={content} />;
//             },
//         });
//         setUi(ui);
//     };

//     return (
//         <Card>
//             <CardContent className="p-4">
//                 <Button onClick={generateDiff}>Generate Diff</Button>
//                 <div className="mt-4">
//                     {ui || <DiffViewer diffText={generation} />}
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }

// // "use client";

// // import { streamUI } from 'ai/rsc';
// // import { useState } from 'react';
// // import { OpenAI } from '@ai-sdk/openai';
// // import DiffViewer from './DiffViewer';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent } from '@/components/ui/card';

// // const openai = new OpenAI({
// //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// // });

// // export function GenerativeDiff({ prompt, code }: { prompt: string; code: string }) {
// //     const [generation, setGeneration] = useState<string>('');
// //     const [ui, setUi] = useState<React.ReactNode | null>(null);

// //     const generateDiff = async () => {
// //         const { ui } = await streamUI({
// //             model: openai('gpt-4'),
// //             prompt,
// //             text: ({ content }) => {
// //                 setGeneration(content);
// //                 return <DiffViewer diffText={content} />;
// //             },
// //         });
// //         setUi(ui);
// //     };

// //     return (
// //         <Card>
// //             <CardContent className="p-4">
// //                 <Button onClick={generateDiff}>Generate Diff</Button>
// //                 <div className="mt-4">
// //                     {ui || <DiffViewer diffText={generation} />}
// //                 </div>
// //             </CardContent>
// //         </Card>
// //     );
// // }