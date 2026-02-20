"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Key, Lock, Search } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

const PUZZLES = [
    {
        riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind.",
        answer: "echo",
        hint: "A repeating sound."
    },
    {
        riddle: "The more of this there is, the less you see.",
        answer: "darkness",
        hint: "Lack of light."
    },
    {
        riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish.",
        answer: "map",
        hint: "Paper guide."
    },
    {
        riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?",
        answer: "m",
        hint: "A letter."
    },
    {
        riddle: "I am always hungry, I must always be fed. The finger I touch, will soon turn red.",
        answer: "fire",
        hint: "Hot stuff."
    }
];

export default function TypingEscapeRoomGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // State
    const [room, setRoom] = useState(0);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [hintVisible, setHintVisible] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [finished, setFinished] = useState(false);

    const checkAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        const currentPuzzle = PUZZLES[room];

        if (input.toLowerCase().trim() === currentPuzzle.answer) {
            playSound('correct');
            setFeedback("The lock clicks open.");
            setInput('');
            setHintVisible(false);

            setTimeout(() => {
                if (room < PUZZLES.length - 1) {
                    setRoom(r => r + 1);
                    setFeedback('');
                } else {
                    setFinished(true);
                    playSound('win');
                }
            }, 1000);
        } else {
            playSound('wrong');
            setFeedback("Nothing happens.");
            setInput('');
        }
    };

    if (finished) {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '100vh' }}>
                <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>ESCAPED</h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                    Time: {((Date.now() - startTime) / 1000).toFixed(2)}s
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Button variant="primary" onClick={() => window.location.reload()}>Re-Enter</Button>
                    <Button variant="outline" onClick={() => router.push('/games')}>Leave</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>ROOM {room + 1}</h1>
            <p className="text-muted" style={{ marginBottom: '3rem' }}>Solve the riddle to escape.</p>

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
                <Lock size={48} color="#00f3ff" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '1.5rem', lineHeight: '1.6', marginBottom: '2rem', fontFamily: '"Outfit", sans-serif' }}>
                    "{PUZZLES[room].riddle}"
                </p>

                {hintVisible && (
                    <p style={{ color: '#ffd700', marginBottom: '1rem', fontStyle: 'italic' }}>Hint: {PUZZLES[room].hint}</p>
                )}

                <form onSubmit={checkAnswer}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type answer..."
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.2rem',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(0,243,255,0.3)',
                            borderRadius: '4px',
                            color: '#fff',
                            textAlign: 'center',
                            marginBottom: '1rem'
                        }}
                    />
                    <Button variant="primary" type="submit" style={{ width: '100%' }}>UNLOCK</Button>
                </form>

                {feedback && (
                    <p style={{ marginTop: '1rem', color: feedback.includes('clicks') ? '#00f3ff' : '#ff0055' }}>
                        {feedback}
                    </p>
                )}
            </div>

            <Button variant="ghost" onClick={() => setHintVisible(true)}><Search size={16} style={{ marginRight: '8px' }} /> Inspect Room (Hint)</Button>
            <div style={{ marginTop: '2rem' }}>
                <Button variant="ghost" onClick={() => router.push('/games')}>Give Up</Button>
            </div>
        </div>
    );
}
