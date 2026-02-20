"use client";

import React, { useEffect, useState } from 'react';
import { useTypingTest } from '@/hooks/useTypingTest';
import TypingArea from '@/components/features/typing/TypingArea';
import { subscribeToRoom, updateProgress, GameRoom, Player } from '@/lib/multiplayer';
import { useAuth } from '@/context/AuthContext';
import { Users, Trophy } from 'lucide-react';
import { antiCheat } from '@/lib/anticheat';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';

interface MultiplayerGameProps {
    roomId: string;
}

export default function MultiplayerGame({ roomId }: MultiplayerGameProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [room, setRoom] = useState<GameRoom | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);

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

    // Anti-Cheat Logging
    useEffect(() => {
        if (isActive && input.length > 0) {
            const char = input[input.length - 1];
            antiCheat.logKey(char);
        }
    }, [input, isActive]);

    // Anti-Cheat Validation on Finish
    useEffect(() => {
        if (isFinished) {
            const { isValid, suspicionScore, reason } = antiCheat.validate(input.length, (60 - timeLeft) * 1000);
            if (!isValid) {
                console.warn(`Anti-Cheat Flag: ${reason} (Score: ${suspicionScore})`);
            } else {
                console.log("Score validated cleanly.");
            }
            antiCheat.reset();
        }
    }, [isFinished, input.length, timeLeft]);

    // Subscribe to room updates
    useEffect(() => {
        const unsubscribe = subscribeToRoom(roomId, (data) => {
            if (data) {
                setRoom(data);
                setPlayers(Object.values(data.players));
            }
        });
        return () => unsubscribe();
    }, [roomId]);

    // Sync progress to Firebase
    useEffect(() => {
        if (user && isActive) {
            // Calculate progress based on input length vs text length
            const rawProgress = Math.min(100, Math.floor((input.length / text.length) * 100));
            updateProgress(roomId, user.uid, rawProgress, stats.wpm);
        }
    }, [input, stats.wpm, isActive, roomId, user, text]);

    // Handle game completion
    useEffect(() => {
        if (isFinished && user) {
            updateProgress(roomId, user.uid, 100, stats.wpm);
        }
    }, [isFinished, roomId, user, stats.wpm]);

    if (!room) return <div className="text-center p-10">Loading game...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

            {/* Header / HUD */}
            <div className="glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Users size={20} />
                    <span>{players.length} Players</span>
                </div>
                <div className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {room.status === 'playing' ? `Time: ${timeLeft}s` : 'Waiting for host...'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

                {/* Main Typing Area */}
                <div>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <TypingArea
                            text={text}
                            input={input}
                            stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft }}
                            isActive={isActive || room.status === 'playing'}
                            isFinished={isFinished}
                            onInput={handleInput}
                            onReset={resetTest}
                        />
                    </div>
                </div>

                {/* Sidebar: Players List */}
                <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Live Standings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {players.sort((a, b) => b.wpm - a.wpm).map(player => (
                            <div key={player.id} style={{
                                padding: '0.8rem',
                                background: player.id === user?.uid ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                border: player.id === user?.uid ? '1px solid var(--accent-primary)' : '1px solid transparent'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                                        {player.name} {player.isHost && '👑'}
                                    </span>
                                    <span style={{ color: 'var(--accent-secondary)' }}>{player.wpm} WPM</span>
                                </div>
                                {/* Progress Bar */}
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${player.progress}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isFinished && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Button variant="outline" onClick={() => router.push('/competition')}>Leave Lobby</Button>
                </div>
            )}
        </div>
    );
}
