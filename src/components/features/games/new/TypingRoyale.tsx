"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Crown, Users, Skull, Target } from 'lucide-react';
import TypingArea from '@/components/features/typing/TypingArea';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useSound } from '@/context/SoundContext';

// Mock Players
const MOCK_NAMES = ["Spectre", "Raptor", "Viper", "Ghost", "Titan", "Shadow", "Phoenix", "Storm", "Blaze", "Frost"];

interface Player {
    id: string;
    name: string;
    wpm: number;
    status: 'alive' | 'eliminated';
    avatar_color: string;
}

export default function TypingRoyaleGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // State
    const [players, setPlayers] = useState<Player[]>([]);
    const [rank, setRank] = useState(50);
    const [playersLeft, setPlayersLeft] = useState(50);
    const [zoneTimer, setZoneTimer] = useState(10);
    const [gameState, setGameState] = useState<'lobby' | 'playing' | 'eliminated' | 'victory'>('lobby');

    // Typing Hook
    const {
        text,
        input,
        stats,
        isActive,
        handleInput,
        resetTest
    } = useTypingTest(300); // 5 min max

    // Initialize Mock Lobby
    useEffect(() => {
        const initialPlayers: Player[] = [];
        for (let i = 0; i < 49; i++) {
            initialPlayers.push({
                id: `bot-${i}`,
                name: MOCK_NAMES[i % MOCK_NAMES.length] + Math.floor(Math.random() * 100),
                wpm: 30 + Math.floor(Math.random() * 60),
                status: 'alive',
                avatar_color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            });
        }
        setPlayers(initialPlayers);
    }, []);

    // Game Logic Loop
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                // Decrease Zone Timer
                setZoneTimer(prev => {
                    if (prev <= 1) {
                        // ELIMINATION WAVE
                        eliminateBottomPlayer();
                        return 10; // Reset timer
                    }
                    return prev - 1;
                });

                // Update Bot WPMs randomly to simulate fluctuation
                setPlayers(current => current.map(p => {
                    if (p.status === 'eliminated') return p;
                    const fluctuation = Math.random() > 0.5 ? 2 : -2;
                    return { ...p, wpm: Math.max(10, Math.min(150, p.wpm + fluctuation)) };
                }));

            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);

    const eliminateBottomPlayer = () => {
        // Calculate user's WPM vs Bots
        const userWpm = stats.wpm;

        // Combine user + bots
        const activeBots = players.filter(p => p.status === 'alive');
        if (activeBots.length === 0) {
            setGameState('victory');
            playSound('win');
            return;
        }

        // Sort by WPM
        // We need to compare user WPM with the lowest bot WPM
        const sortedBots = [...activeBots].sort((a, b) => a.wpm - b.wpm);
        const lowestBot = sortedBots[0];

        // 50% chance to eliminate the lowest bot, OR eliminate user if user is lowest
        // For gameplay fun, let's compare strictly.

        if (userWpm < lowestBot.wpm && isActive) {
            // User is eliminated!
            setGameState('eliminated');
            playSound('lose');
        } else {
            // Eliminate lowest bot
            setPlayers(current => current.map(p =>
                p.id === lowestBot.id ? { ...p, status: 'eliminated' } : p
            ));
            setPlayersLeft(prev => prev - 1);
            playSound('wrong'); // Elimination sound effect
        }
    };

    const startGame = () => {
        setGameState('playing');
        resetTest();
        setPlayersLeft(50);
        setZoneTimer(10);
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh' }}>

            {/* HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid #ffd700' }}>
                    <div className="text-muted">Alive</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{playersLeft}/50</div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid #ff0055', textAlign: 'center' }}>
                    <div className="text-muted">Zone Closing</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: zoneTimer < 4 ? '#ff0055' : '#fff' }}>{zoneTimer}s</div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid #00f3ff' }}>
                    <div className="text-muted">Your WPM</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Math.round(stats.wpm)}</div>
                </div>
            </div>

            {/* Battle Feed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>

                {/* Kill Feed / Player List (Condensed) */}
                <div className="glass-panel" style={{ padding: '1rem', height: '400px', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} /> Players
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,243,255,0.1)', borderRadius: '4px', border: '1px solid #00f3ff' }}>
                            <span>YOU</span>
                            <span>{Math.round(stats.wpm)} WPM</span>
                        </div>
                        {players.filter(p => p.status === 'alive').sort((a, b) => b.wpm - a.wpm).map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <span style={{ color: p.avatar_color }}>{p.name}</span>
                                <span className="text-muted">{p.wpm} WPM</span>
                            </div>
                        ))}
                        {players.filter(p => p.status === 'eliminated').map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', opacity: 0.3 }}>
                                <span style={{ textDecoration: 'line-through' }}>{p.name}</span>
                                <span style={{ color: '#ff0055' }}>ELIMINATED</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Area */}
                <div className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>

                    {gameState === 'lobby' && (
                        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                            <Crown size={64} color="#ffd700" style={{ marginBottom: '1rem' }} />
                            <h1>Typing Royale</h1>
                            <p className="text-muted" style={{ marginBottom: '2rem' }}>50 Players enter. 1 Leaves. Stay above the WPM cutoff!</p>
                            <Button variant="primary" onClick={startGame} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>Deploy</Button>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <TypingArea
                            text={text}
                            input={input}
                            stats={stats}
                            isActive={true}
                            isFinished={false}
                            onInput={handleInput}
                            onReset={resetTest}
                        />
                    )}

                    {gameState === 'eliminated' && (
                        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                            <Skull size={64} color="#ff0055" style={{ marginBottom: '1rem' }} />
                            <h1 style={{ color: '#ff0055' }}>ELIMINATED</h1>
                            <p className="text-muted">You fell behind the safe zone.</p>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button variant="primary" onClick={startGame}>Re-Deploy</Button>
                                <Button variant="outline" onClick={() => router.push('/games')}>Exit to Lobby</Button>
                            </div>
                        </div>
                    )}

                    {gameState === 'victory' && (
                        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                            <Crown size={64} color="#ffd700" style={{ marginBottom: '1rem' }} />
                            <h1 className="gradient-text">#1 VICTORY ROYALE</h1>
                            <p className="text-muted">You are the champion of the arena.</p>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button variant="primary" onClick={startGame}>Play Again</Button>
                                <Button variant="outline" onClick={() => router.push('/games')}>Exit to Lobby</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
