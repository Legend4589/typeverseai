"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { Loader2, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createRoom, joinRoom } from '@/lib/multiplayer';
import MultiplayerGame from '@/components/features/multiplayer/MultiplayerGame';

export default function GameLobby() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [status, setStatus] = useState('initializing'); // initializing, creating, joining, playing, error
    const [roomId, setRoomId] = useState<string | null>(null);

    const gameId = params.id as string;

    useEffect(() => {
        if (!user) return;

        const initLobby = async () => {
            // 1. Arcade Redirects (already handled, but safety check)
            if (gameId === 'game-2') {
                router.push('/games/word-rain');
                return;
            }

            // 2. Create Room Logic (for modes)
            if (gameId === 'ranked' || gameId === 'tournament') {
                setStatus('creating');
                try {
                    const newRoomId = await createRoom(user.uid, user.email?.split('@')[0] || 'Player', gameId);
                    // Redirect to the new room ID so other players can join this URL
                    // But for now, let's just treat this current view AS the room for simplicity 
                    // or better, redirect to /lobby/[newRoomId] to perform the 'join' logic there?
                    // Let's redirect to ensure URL is shareable.
                    router.push(`/lobby/${newRoomId}`);
                } catch (e) {
                    console.error(e);
                    setStatus('error');
                }
            }
            // 3. Join Room Logic (if it looks like a Room ID)
            else if (gameId.startsWith('-') || gameId.length > 10) {
                // Firebase IDs usually start with - or are long
                setStatus('joining');
                setRoomId(gameId);
                try {
                    const joined = await joinRoom(gameId, user.uid, user.email?.split('@')[0] || 'Guest');
                    if (joined) {
                        setStatus('playing');
                    } else {
                        setStatus('error'); // Room not found or full
                    }
                } catch (e) {
                    console.error(e);
                    setStatus('error');
                }
            }
            else {
                // Fallback for unknown IDs - maybe simulated for now?
                // router.push(`/typing-test?mode=${gameId}`);
            }
        };

        if (status === 'initializing') {
            initLobby();
        }
    }, [gameId, user, router, status]);

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <h2>Please Login</h2>
                <p>You need to be logged in to play multiplayer.</p>
                <Button onClick={() => router.push('/login')}>Login</Button>
            </div>
        );
    }

    if (status === 'playing' && roomId) {
        return <MultiplayerGame roomId={roomId} />;
    }

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', minWidth: '400px' }}>

                {status === 'initializing' && <Loader2 className="spin" size={48} />}

                {status === 'creating' && (
                    <>
                        <Loader2 className="spin" size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                        <h2>Creating Room...</h2>
                    </>
                )}

                {status === 'joining' && (
                    <>
                        <Loader2 className="spin" size={48} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
                        <h2>Joining Room...</h2>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2>Error</h2>
                        <p className="text-muted">Could not join room. It may be full or invalid.</p>
                        <Button onClick={() => router.push('/competition')}>Back</Button>
                    </>
                )}

                {status === 'playing' && (
                    <h2>Starting Game...</h2>
                )}

            </div>
            <style jsx global>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
