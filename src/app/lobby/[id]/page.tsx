"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { Loader2, Users, CheckCircle } from 'lucide-react';

export default function GameLobby() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState('connecting'); // connecting, searching, found, ready
    const [timeLeft, setTimeLeft] = useState(3);

    const gameId = params.id;
    const isRanked = gameId === 'ranked';

    useEffect(() => {
        // Simulate connection sequence
        const t1 = setTimeout(() => setStatus('searching'), 1500);
        const t2 = setTimeout(() => setStatus('found'), 3500);
        const t3 = setTimeout(() => setStatus('ready'), 5000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    useEffect(() => {
        if (status === 'ready' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (status === 'ready' && timeLeft === 0) {
            router.push(`/typing-test?mode=${gameId}`);
        }
    }, [status, timeLeft, router, gameId]);

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', minWidth: '400px' }}>

                {status === 'connecting' && (
                    <>
                        <Loader2 className="spin" size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                        <h2>Connecting to Server...</h2>
                        <p className="text-muted">Establishing secure handshake</p>
                    </>
                )}

                {status === 'searching' && (
                    <>
                        <Loader2 className="spin" size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                        <h2>Searching for Opponents...</h2>
                        <p className="text-muted">{isRanked ? 'Looking for players near your skill level' : 'Finding game server'}</p>
                    </>
                )}

                {status === 'found' && (
                    <>
                        <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h2>Match Found!</h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 0.5rem' }}></div>
                                <span style={{ fontSize: '0.8rem' }}>You</span>
                            </div>
                            <span style={{ marginTop: '15px', color: 'var(--text-muted)' }}>VS</span>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-secondary)', margin: '0 auto 0.5rem' }}></div>
                                <span style={{ fontSize: '0.8rem' }}>Player_99</span>
                            </div>
                        </div>
                    </>
                )}

                {status === 'ready' && (
                    <>
                        <h1 style={{ fontSize: '4rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>{timeLeft}</h1>
                        <h2>Get Ready!</h2>
                        <p className="text-muted">Game starting in...</p>
                    </>
                )}

                <div style={{ marginTop: '2rem' }}>
                    <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
                </div>
            </div>

            <style jsx global>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
