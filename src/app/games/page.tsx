"use client";

import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Skull, Droplets, Zap, Swords } from 'lucide-react';

export default function GamesPage() {
    const games = [
        {
            id: 1,
            title: "Zombie Swipe",
            description: "Type words to kill zombies before they reach you.",
            icon: <Skull size={48} color="#ff0055" />,
            difficulty: "Hard",
            color: "#ff0055"
        },
        {
            id: 2,
            title: "Word Rain",
            description: "Words are falling! Type them to clear the screen.",
            icon: <Droplets size={48} color="#00f3ff" />,
            difficulty: "Medium",
            color: "#00f3ff"
        },
        {
            id: 3,
            title: "Speed Burst",
            description: "60 seconds of pure adrenaline. No backspace allowed.",
            icon: <Zap size={48} color="#ffaa00" />,
            difficulty: "Extreme",
            color: "#ffaa00"
        },
        {
            id: 4,
            title: "Type Battle",
            description: "RPG style battle. Typing deals damage.",
            icon: <Swords size={48} color="#7b2cbf" />,
            difficulty: "Easy",
            color: "#7b2cbf"
        }
    ];

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>
                    Arcade Mode
                </h1>
                <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Typing doesn't have to be boring. Play games, improve skills.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {games.map(game => (
                    <Link href={`/lobby/game-${game.id}`} key={game.id} style={{ textDecoration: 'none' }}>
                        <div className="glass-panel hover-card" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            border: `1px solid ${game.color}40`,
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            height: '100%'
                        }}>
                            <div style={{ padding: '1.5rem', background: `${game.color}20`, borderRadius: '50%', marginBottom: '1.5rem' }}>
                                {game.icon}
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{game.title}</h3>
                            <div style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                background: game.color,
                                color: '#000',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem'
                            }}>
                                {game.difficulty.toUpperCase()}
                            </div>
                            <p className="text-muted" style={{ marginBottom: '1.5rem', flexGrow: 1 }}>{game.description}</p>
                            <Button variant="outline" style={{ width: '100%', borderColor: game.color, color: game.color }}>Play Now</Button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
