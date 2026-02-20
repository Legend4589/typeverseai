"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Timer, Rewind, FastForward } from 'lucide-react';
import TypingArea from '@/components/features/typing/TypingArea';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useSound } from '@/context/SoundContext';

export default function TimeWarpGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // State
    const [timeScale, setTimeScale] = useState(1.0);
    const [displayTime, setDisplayTime] = useState(60.0);
    const [streak, setStreak] = useState(0);

    const {
        text,
        input,
        stats,
        isActive,
        isFinished,
        handleInput,
        resetTest
    } = useTypingTest(999); // Infinite hook timer, we manage custom timer

    // Custom Timer Logic
    useEffect(() => {
        if (isActive && !isFinished) {
            const interval = setInterval(() => {
                setDisplayTime(prev => {
                    if (prev <= 0) return 0;
                    return prev - (0.1 * timeScale); // Time moves based on scale
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isActive, isFinished, timeScale]);

    // Check Input for Time Dilation
    const lastInputLen = useRef(0);
    useEffect(() => {
        if (input.length > lastInputLen.current) {
            const char = input[input.length - 1];
            const correctChar = text[input.length - 1];

            if (char === correctChar) {
                // Correct: Slow down time (Matrix style)
                setTimeScale(prev => Math.max(0.2, prev - 0.05));
                setStreak(s => s + 1);

                if (streak > 0 && streak % 10 === 0) playSound('correct');
            } else {
                // Wrong: Speed up time penalty
                setTimeScale(prev => Math.min(3.0, prev + 0.5));
                setStreak(0);
                playSound('wrong');
            }
        }
        lastInputLen.current = input.length;
    }, [input, text, streak, playSound]);

    // Decay Time Scale back to 1.0
    useEffect(() => {
        const decay = setInterval(() => {
            setTimeScale(prev => {
                if (Math.abs(prev - 1.0) < 0.1) return 1.0;
                return prev + (prev < 1.0 ? 0.05 : -0.05);
            });
        }, 500);
        return () => clearInterval(decay);
    }, []);

    const resetGame = () => {
        resetTest();
        setDisplayTime(60.0);
        setTimeScale(1.0);
        setStreak(0);
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh', transition: 'filter 0.5s', filter: timeScale < 0.5 ? 'hue-rotate(180deg)' : 'none' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>TIME WARP</h1>
                <p className="text-muted">Type accurately to slow time. Mistakes speed it up.</p>
            </div>

            {/* Time Dilation Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: displayTime < 10 ? '#ff0055' : '#fff', fontFamily: 'monospace' }}>
                        {displayTime.toFixed(1)}s
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>REMAINING</div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem', width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderColor: timeScale < 1 ? '#00f3ff' : '#ff0055' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: timeScale < 1 ? '#00f3ff' : '#ff0055' }}>
                        {timeScale < 1 ? <Rewind /> : <FastForward />}
                        {timeScale.toFixed(2)}x
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>FLOW RATE</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '3rem' }}>
                <TypingArea
                    text={text}
                    input={input}
                    stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft: 0 }}
                    isActive={isActive}
                    isFinished={isFinished || displayTime <= 0}
                    onInput={handleInput}
                    onReset={resetGame}
                />
            </div>

            {(isFinished || displayTime <= 0) && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>TIME UP</h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>WPM: {Math.round(stats.wpm)}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button variant="primary" onClick={resetGame}>Rewrite Time</Button>
                        <Button variant="outline" onClick={() => router.push('/games')}>Exit Loop</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
