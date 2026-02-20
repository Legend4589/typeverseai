"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Swords, Trophy, Target, Zap, Clock, Medal } from 'lucide-react';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user } = useAuth(); // Assuming this context exists and provides user info
    const router = useRouter();

    // Mock Stats (In real app, fetch from Firestore/DB)
    const stats = {
        rank: 'Diamond',
        mmr: 2850,
        gamesPlayed: 142,
        wins: 89,
        bestWpm: 124,
        avgAccuracy: 98.5,
        playTime: '12h 45m'
    };

    const matchHistory = [
        { game: 'Typing Royale', result: 'Victory', wpm: 110, date: '2 mins ago' },
        { game: 'Type Battle', result: 'Defeat', wpm: 95, date: '15 mins ago' },
        { game: 'Word Rain', result: 'Score: 4500', wpm: 102, date: '1 hour ago' },
    ];

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <h1>Please Login to view Profile</h1>
                <Button variant="primary" onClick={() => router.push('/login')}>Login</Button>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, #00f3ff, #ff00ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                    {user.displayName?.[0] || 'P'}
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{user.displayName || 'Player'}</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(0,243,255,0.1)', color: '#00f3ff', padding: '0.2rem 0.8rem', borderRadius: '4px', border: '1px solid #00f3ff' }}>
                            {stats.rank}
                        </span>
                        <span className="text-muted">MMR: {stats.mmr}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Swords size={32} color="#00f3ff" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.gamesPlayed}</div>
                    <div className="text-muted">Matches</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Trophy size={32} color="#ffd700" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.wins}</div>
                    <div className="text-muted">Wins</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Zap size={32} color="#ffaa00" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.bestWpm}</div>
                    <div className="text-muted">Best WPM</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Target size={32} color="#ff0055" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.avgAccuracy}%</div>
                    <div className="text-muted">Accuracy</div>
                </div>
            </div>

            {/* Match History */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={24} /> Recent Activity
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matchHistory.map((match, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{match.game}</span>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>{match.date}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{match.wpm} WPM</span>
                                <span style={{
                                    color: match.result === 'Victory' ? '#00ff00' : match.result === 'Defeat' ? '#ff0055' : '#fff',
                                    fontWeight: 'bold'
                                }}>
                                    {match.result}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
