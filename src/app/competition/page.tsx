"use client";

import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Trophy, Users, Globe, Zap } from 'lucide-react';

export default function CompetitionPage() {
    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>
                    Competitive Arena
                </h1>
                <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Prove your speed against real players in real-time.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Mode 1: 1v1 */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)', opacity: 0.2 }}></div>
                    <Users size={48} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>1v1 Duel</h3>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Head-to-head battle. First to finish wins.</p>
                    <Link href="/lobby/ranked" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" style={{ width: '100%' }}>Find Match</Button>
                    </Link>
                </div>

                {/* Mode 2: Tournament */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'radial-gradient(circle, var(--warning) 0%, transparent 70%)', opacity: 0.2 }}></div>
                    <Trophy size={48} style={{ marginBottom: '1rem', color: 'var(--warning)' }} />
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Tournament</h3>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Monthly bracket. Winner takes all.</p>
                    <Link href="/lobby/tournament" style={{ textDecoration: 'none' }}>
                        <Button variant="outline" style={{ width: '100%' }}>Register (Starts in 2h)</Button>
                    </Link>
                </div>

                {/* Mode 3: Global Race */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)', opacity: 0.2 }}></div>
                    <Globe size={48} style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }} />
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Global Sprint</h3>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Massive multiplayer race with 100+ players.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff00', boxShadow: '0 0 5px #00ff00' }}></div>
                        <span style={{ fontSize: '0.9rem' }}>452 Players Online</span>
                    </div>
                    <Link href="/lobby/global-sprint" style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%' }}>Join Lobby</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
