"use client";

import React, { useState } from 'react';
import Button from '@/components/common/Button';

// Mock data
const mockLeaderboard = [
    { rank: 1, username: "SpeedDemon", wpm: 156, accuracy: 99, badge: "Grandmaster" },
    { rank: 2, username: "TypeKey", wpm: 148, accuracy: 98, badge: "Master" },
    { rank: 3, username: "QWERTY_God", wpm: 142, accuracy: 97, badge: "Pro" },
    { rank: 4, username: "FastFinger", wpm: 135, accuracy: 96, badge: "Expert" },
    { rank: 5, username: "TypoKing", wpm: 128, accuracy: 94, badge: "Advanced" },
    { rank: 6, username: "ClickySwitch", wpm: 120, accuracy: 98, badge: "Expert" },
    { rank: 7, username: "SpaceBar", wpm: 115, accuracy: 95, badge: "Intermediate" },
    { rank: 8, username: "HomeRow", wpm: 110, accuracy: 99, badge: "Intermediate" },
    { rank: 9, username: "ShiftKey", wpm: 105, accuracy: 93, badge: "Beginner" },
    { rank: 10, username: "CtrlAltDel", wpm: 98, accuracy: 92, badge: "Beginner" },
];

export default function LeaderboardPage() {
    const [filter, setFilter] = useState('Global');

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Global Leaderboard</h1>
                <p className="text-muted">Top typists from around the world. Can you beat them?</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                {['Global', 'Daily', 'Monthly'].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? 'primary' : 'secondary'}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </Button>
                ))}
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                            <th style={{ padding: '1.5rem', width: '80px', textAlign: 'center' }}>Rank</th>
                            <th style={{ padding: '1.5rem' }}>User</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>WPM</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Accuracy</th>
                            <th style={{ padding: '1.5rem', textAlign: 'center' }}>Badge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockLeaderboard.map((user) => (
                            <tr key={user.rank} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: user.rank <= 3 ? 'var(--accent-primary)' : 'inherit' }}>
                                    {user.rank}
                                </td>
                                <td style={{ padding: '1.5rem', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${user.username.length * 30}, 70%, 50%)` }}></div>
                                        {user.username}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                    {user.wpm}
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right', color: user.accuracy >= 98 ? 'var(--success)' : 'var(--text-secondary)' }}>
                                    {user.accuracy}%
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {user.badge}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
