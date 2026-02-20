"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Zap, Timer, RefreshCw, Users, User } from 'lucide-react';
import { useTypingTest } from '@/hooks/useTypingTest';
import TypingArea from '@/components/features/typing/TypingArea';
import { useSound } from '@/context/SoundContext';

// Multiplayer Logic Imports (We might need to move some logic here or import hooks)
import { createRoom, joinRoom, subscribeToRoom, updateProgress } from '@/lib/multiplayer';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function SpeedBurstGame() {
    const router = useRouter();
    const { playSound, playBGM, stopBGM } = useSound();

    // UI State
    const [mode, setMode] = useState<'menu' | 'single' | 'multi_lobby' | 'multi_game'>('menu');
    const [roomId, setRoomId] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');
    const [players, setPlayers] = useState<any[]>([]);
    const [user, setUser] = useState<FirebaseUser | null>(null);

    // Typing State
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

    // Auth Check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    // Multiplayer Subscription
    useEffect(() => {
        if (mode === 'multi_game' && roomId) {
            const unsubscribe = subscribeToRoom(roomId, (data) => {
                if (data && data.players) {
                    const playerList = Object.values(data.players);
                    setPlayers(playerList);
                }
            });
            return () => unsubscribe();
        }
    }, [mode, roomId]);

    // Progress Sync
    useEffect(() => {
        if (mode === 'multi_game' && isActive && user) {
            const progress = Math.min(100, Math.floor((input.length / text.length) * 100));
            updateProgress(roomId, user.uid, progress, stats.wpm);
        }
    }, [input, isActive, mode, roomId, user, stats.wpm]);

    const handleCreateRoom = async () => {
        if (!user) return alert("Please login to play multiplayer");
        try {
            const newId = await createRoom(user.uid, user.displayName || 'Player', 'speed-burst');
            setRoomId(newId);
            setMode('multi_game');
        } catch (e) {
            console.error(e);
            alert("Error creating room");
        }
    };

    const handleJoinRoom = async () => {
        if (!user) return alert("Please login to play multiplayer");
        if (!inputRoomId) return;
        try {
            const success = await joinRoom(inputRoomId, user.uid, user.displayName || 'Player');
            if (success) {
                setRoomId(inputRoomId);
                setMode('multi_game');
            } else {
                alert("Room not found or full");
            }
        } catch (e) {
            console.error(e);
            alert("Error joining room");
        }
    };

    // Custom Input Handler (No Backspace)
    const handleBurstInput = (val: string) => {
        if (isActive && val.length < input.length) return; // Prevent backspace effect updates if we want strict
        handleInput(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            playSound('wrong');
        } else {
            playSound('click');
        }
    };

    // Render Menu
    if (mode === 'menu') {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Zap size={64} color="#ffaa00" /> Speed Burst
                </h1>
                <p className="text-muted" style={{ marginBottom: '4rem' }}>60 Seconds. No Backspace. Pure Speed.</p>

                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                    <div className="glass-panel hover-card" onClick={() => setMode('single')} style={{ padding: '3rem', cursor: 'pointer', width: '300px' }}>
                        <User size={48} color="#00f3ff" style={{ marginBottom: '1rem' }} />
                        <h2>Single Player</h2>
                        <p className="text-muted">Practice your speed solo.</p>
                    </div>
                    <div className="glass-panel hover-card" onClick={() => setMode('multi_lobby')} style={{ padding: '3rem', cursor: 'pointer', width: '300px' }}>
                        <Users size={48} color="#ffaa00" style={{ marginBottom: '1rem' }} />
                        <h2>Multiplayer</h2>
                        <p className="text-muted">Race against others in real-time.</p>
                    </div>
                </div>
                <div style={{ marginTop: '3rem' }}>
                    <Button variant="ghost" onClick={() => router.push('/games')}>Back to Visual Arcade</Button>
                </div>
            </div>
        );
    }

    // Render Multiplayer Lobby
    if (mode === 'multi_lobby') {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '2rem' }}>Multiplayer Lobby</h1>
                <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
                    <Button variant="primary" onClick={handleCreateRoom} style={{ width: '100%', marginBottom: '2rem' }}>Create Room</Button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Enter Room Code"
                            value={inputRoomId}
                            onChange={(e) => setInputRoomId(e.target.value)}
                            style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px' }}
                        />
                        <Button variant="outline" onClick={handleJoinRoom}>Join</Button>
                    </div>
                </div>
                <Button variant="ghost" onClick={() => setMode('menu')} style={{ marginTop: '2rem' }}>Back</Button>
            </div>
        );
    }

    // Render Game (Single & Multi)
    return (
        <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }} className="container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Zap size={48} color="#ffaa00" fill="#ffaa00" /> Speed Burst <span style={{ fontSize: '1rem', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{mode === 'multi_game' ? 'MULTIPLAYER' : 'SOLO'}</span>
                </h1>
            </div>

            {/* Multiplayer Race Track */}
            {mode === 'multi_game' && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>
                    {players.map((p, i) => (
                        <div key={i} style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                                <span>{p.name} {p.id === user?.uid ? '(You)' : ''}</span>
                                <span>{p.wpm || 0} WPM</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px' }}>
                                <div style={{
                                    width: `${p.progress || 0}%`,
                                    height: '100%',
                                    background: p.id === user?.uid ? '#ffaa00' : '#aaa',
                                    borderRadius: '4px',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto', border: '1px solid #ffaa00' }}>
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
                    {mode === 'multi_game' ? (
                        <Button variant="primary" onClick={() => setMode('multi_lobby')}>Back to Lobby</Button>
                    ) : (
                        <Button variant="primary" onClick={resetTest}>Retry</Button>
                    )}
                    <Button variant="outline" onClick={() => setMode('menu')}>Main Menu</Button>
                </div>
            )}
        </div>
    );
}
