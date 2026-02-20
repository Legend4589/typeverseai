"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Zap, Timer, RefreshCw } from 'lucide-react';
import { useTypingTest } from '@/hooks/useTypingTest';
import TypingArea from '@/components/features/typing/TypingArea';

export default function SpeedBurstGame() {
    const router = useRouter();
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

    const handleBurstInput = (val: string) => {
        // "No backspace allowed" mechanic
        if (isActive && val.length < input.length) {
            // User tried to delete - prevent it or penalize?
            // For simplicity, just don't allow it to update state if length decreases
            // Actually, preventing backspace in standard input is hard without blocking keydown
            return;
        }
        handleInput(val);
    };

    // Custom backspace prevention
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }} className="container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Zap size={48} color="#ffaa00" fill="#ffaa00" /> Speed Burst
                </h1>
                <p className="text-muted">60 Seconds. No Backspace. Pure Speed.</p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto', border: '1px solid #ffaa00' }}>
                {/* Re-using TypingArea but with custom key handler wrapper if possible, 
                     or just passing props. The current TypingArea doesn't expose keydown easily.
                     Let's use a wrapper div to capture keydown phase. */}
                <div onKeyDownCapture={handleKeyDown}>
                    <TypingArea
                        text={text}
                        input={input}
                        stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft }}
                        isActive={isActive}
                        isFinished={isFinished}
                        onInput={handleInput}
                        onReset={resetTest}
                    />
                </div>
            </div>

            {isFinished && (
                <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Button variant="outline" onClick={() => router.push('/games')}>Exit</Button>
                </div>
            )}
        </div>
    );
}
