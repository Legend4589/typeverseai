"use client";

import React, { useEffect } from 'react';
import { useTypingTest } from '@/hooks/useTypingTest';
import TypingArea from '@/components/features/typing/TypingArea';
import Button from '@/components/common/Button';
import Navbar from '@/components/layout/Navbar';
// Navbar is in layout, but sometimes layout doesn't re-render on nav? 
// No, layout is persistent. I don't need to import Navbar here.
// But I might add a sidebar or something specific. For now, just the test.

export default function TypingTestPage() {
    const {
        text,
        input,
        timeLeft,
        isActive,
        isFinished,
        stats,
        handleInput,
        resetTest
    } = useTypingTest(60);

    return (
        <div className="container" style={{ paddingTop: '4rem', minHeight: '100vh' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    Speed Test
                </h1>
                <p className="text-muted">Test your wpm and improve your skills.</p>
            </header>

            <div className="glass-panel" style={{ padding: '3rem' }}>
                <TypingArea
                    text={text}
                    input={input}
                    stats={{
                        wpm: stats.wpm,
                        accuracy: stats.accuracy,
                        timeLeft: timeLeft
                    }}
                    isActive={isActive}
                    isFinished={isFinished}
                    onInput={handleInput}
                    onReset={resetTest}
                />
            </div>

            {isFinished && (
                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <h3>Performance Analysis</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginTop: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4>Raw WPM</h4>
                            <p style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{stats.rawWpm}</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4>Accuracy</h4>
                            <p style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats.accuracy}%</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4>Correct</h4>
                            <p style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats.correctChars}</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4>Errors</h4>
                            <p style={{ fontSize: '2rem', color: 'var(--error)' }}>{stats.incorrectChars}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
