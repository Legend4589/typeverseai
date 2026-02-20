"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Eye, EyeOff, Brain } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

const LEVELS = [
    { count: 3, time: 3000 },
    { count: 4, time: 4000 },
    { count: 5, time: 5000 },
    { count: 6, time: 6000 },
    { count: 7, time: 7000 },
    { count: 8, time: 8000 },
];

const WORDS = ["apple", "bread", "chair", "dance", "eagle", "fruit", "grape", "house", "igloo", "jelly", "kite", "lemon", "mouse", "night", "ocean", "piano", "queen", "river", "snake", "tiger", "umbra", "virus", "water", "xenon", "yacht", "zebra"];

export default function MemoryTypingGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // State
    const [level, setLevel] = useState(0);
    const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
    const [targetWords, setTargetWords] = useState<string[]>([]);
    const [userInput, setUserInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        startLevel(0);
    }, []);

    const startLevel = (lvlIdx: number) => {
        const lvl = LEVELS[Math.min(lvlIdx, LEVELS.length - 1)];
        const newWords = [];
        for (let i = 0; i < lvl.count; i++) {
            newWords.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
        }
        setTargetWords(newWords);
        setPhase('memorize');
        setTimeLeft(lvl.time / 1000);
        setUserInput('');
        setFeedback('');
    };

    // Timer for Memorize Phase
    useEffect(() => {
        if (phase === 'memorize') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setPhase('recall');
            }
        }
    }, [phase, timeLeft]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const inputWords = userInput.toLowerCase().split(' ').map(w => w.trim()).filter(w => w);

        let correctCount = 0;
        inputWords.forEach((w, i) => {
            if (w === targetWords[i]) correctCount++;
        });

        if (correctCount === targetWords.length) {
            playSound('correct');
            setScore(s => s + (correctCount * 100));
            setFeedback("Perfect Recall!");
            setTimeout(() => {
                startLevel(level + 1);
                setLevel(l => l + 1);
            }, 1000);
        } else {
            playSound('wrong');
            setFeedback(`Incorrect. Answers: ${targetWords.join(', ')}`);
            setPhase('result');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh', textAlign: 'center' }}>

            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>MEMORY MATRIX</h1>
            <p className="text-muted" style={{ marginBottom: '3rem' }}>Level {level + 1}</p>

            <div className="glass-panel" style={{ padding: '3rem', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                {phase === 'memorize' && (
                    <>
                        <Eye size={48} color="#00f3ff" style={{ marginBottom: '2rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {targetWords.map((w, i) => (
                                <span key={i} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{w}</span>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', fontSize: '1.5rem', color: '#ffd700' }}>
                            Hiding in {timeLeft}s...
                        </div>
                    </>
                )}

                {phase === 'recall' && (
                    <>
                        <Brain size={48} color="#ff0055" style={{ marginBottom: '2rem' }} />
                        <p style={{ marginBottom: '1rem' }}>Type the words in order, separated by spaces.</p>
                        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.5rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid #ff0055',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginBottom: '1rem'
                                }}
                            />
                            <Button variant="primary" type="submit">SUBMIT</Button>
                        </form>
                    </>
                )}

                {phase === 'result' && (
                    <>
                        <h2 style={{ color: '#ff0055', marginBottom: '1rem' }}>MEMORY FAILED</h2>
                        <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>{feedback}</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="primary" onClick={() => { setLevel(0); startLevel(0); setScore(0); }}>Restart</Button>
                            <Button variant="outline" onClick={() => router.push('/games')}>Exit</Button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
