"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Terminal, Code, Cpu, Play } from 'lucide-react';
import { useTypingTest } from '@/hooks/useTypingTest';
import TypingArea from '@/components/features/typing/TypingArea';
import { useSound } from '@/context/SoundContext';

// Mock Code Snippets
const SNIPPETS = [
    `function quickSort(arr) { if (arr.length <= 1) return arr; }`,
    `const [state, setState] = useState(initialState);`,
    `useEffect(() => { document.title = \`Count: \${count}\`; }, [count]);`,
    `import { NextResponse } from 'next/server';`,
    `export default function Page() { return <div>Hello World</div>; }`,
    `db.collection('users').where('age', '>=', 18).get();`,
    `div { display: flex; justify-content: center; align-items: center; }`,
    `@media (max-width: 768px) { .container { padding: 1rem; } }`,
    `git commit -m "feat: initial commit"`,
    `docker build -t my-app . && docker run -p 3000:3000 my-app`
];

export default function CodeStormGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // State
    const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
    const [lives, setLives] = useState(5);
    const [score, setScore] = useState(0);

    const {
        text,
        input,
        stats,
        isActive,
        isFinished,
        handleInput,
        resetTest,
        setText
    } = useTypingTest(60); // Time doesn't matter as much here, maybe strictly survival?

    // Initialize
    useEffect(() => {
        setText(SNIPPETS[0]);
    }, []);

    // Check Completion
    useEffect(() => {
        if (input === text && text.length > 0) {
            // Snippet Complete
            playSound('correct');
            setScore(s => s + text.length * 10);

            // Next Snippet
            const nextIndex = (currentSnippetIndex + 1) % SNIPPETS.length;
            setCurrentSnippetIndex(nextIndex);

            // Allow a brief pause? Or instant?
            setTimeout(() => {
                const nextText = SNIPPETS[nextIndex];
                setText(nextText);
                handleInput(''); // Reset input manually via hook if supported, or just force input reset
                // Note: useTypingTest might need a strict reset for this flow, 
                // but for now we basically just swap text and clear input.
                // We need to access the internal status of the hook to clear input.
                // Since our hook exposes `handleInput`, passing '' might work if logic permits, 
                // but usually typing tests append. 
                // Let's rely on a key trick or just re-mount/reset.
                // Ideally `resetTest` handles this but it resets timer too.
                // Hack: We'll modify useTypingTest later to support "next level" or just use `resetTest` and manage state externally.
                resetTest(); // This resets stats too... maybe not ideal for a continuous game.
                // For this prototype, resetting stats per snippet is OK, score is global.
            }, 200);
        }
    }, [input, text, currentSnippetIndex, playSound]);

    // Syntax Highlight Dummy
    const renderCode = (code: string) => {
        return code.split(' ').map((word, i) => {
            let color = '#fff';
            if (['function', 'const', 'let', 'var', 'import', 'export', 'default', 'return', 'if', 'else'].includes(word)) color = '#ff0055';
            else if (['useState', 'useEffect', 'NextResponse'].includes(word.replace(/\W/g, ''))) color = '#ffd700';
            else if (word.includes('(') || word.includes(')')) color = '#00f3ff';

            return <span key={i} style={{ color }}>{word} </span>
        });
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh' }}>

            {/* HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid #00f3ff' }}>
                    <div className="text-muted">System Integrity</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{lives * 20}%</div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid #ffd700' }}>
                    <div className="text-muted">Lines Compiled</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700' }}>{Math.floor(score / 100)}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid #ff0055' }}>
                    <div className="text-muted">Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{score}</div>
                </div>
            </div>

            {/* Terminal Window */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: '#0d1117' }}>
                <div style={{ background: '#161b22', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #30363d' }}>
                    <Terminal size={14} color="#8b949e" />
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>root@typeverse:~/projects/storm</span>
                </div>

                <div style={{ padding: '3rem', fontFamily: '"JetBrains Mono", monospace' }}>
                    <div style={{ marginBottom: '2rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                        {/* We can't use the standard TypingArea easily here if we want syntax highlighting for the prompt */
                            /* But TypingArea supports "text" prop. Let's just use it for now. */
                        }
                        <TypingArea
                            text={text}
                            input={input}
                            stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft: 0 }}
                            isActive={isActive}
                            isFinished={isFinished}
                            onInput={handleInput}
                            onReset={resetTest}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Button variant="ghost" onClick={() => router.push('/games')}>abort_process</Button>
            </div>
        </div>
    );
}
