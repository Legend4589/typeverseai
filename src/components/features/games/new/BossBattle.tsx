"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Shield, Sword, AlertTriangle, Activity } from 'lucide-react';
import { useTypingTest } from '@/hooks/useTypingTest';
import TypingArea from '@/components/features/typing/TypingArea';
import { useSound } from '@/context/SoundContext';

type Phase = 'shield' | 'attack' | 'defense';

export default function BossBattleGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // Boss State
    const [bossHp, setBossHp] = useState(1000);
    const [bossShield, setBossShield] = useState(100);
    const [phase, setPhase] = useState<Phase>('shield');
    const [playerHp, setPlayerHp] = useState(100);
    const [message, setMessage] = useState("BREAK THE SHIELD!");

    // Typing
    const {
        text,
        input,
        stats,
        isActive,
        isFinished,
        handleInput,
        resetTest,
        setText
    } = useTypingTest(999);

    // Phase Management
    useEffect(() => {
        if (phase === 'shield') {
            setMessage("BREAK THE SHIELD! Type FAST!");
            setText("power overload system critical breach firewall defense matrix");
        } else if (phase === 'attack') {
            setMessage("SHIELD DOWN! STRIKE NOW!");
            setText("unleash ultimate destruction upon the target core system vulnerable execute command override");
        } else if (phase === 'defense') {
            setMessage("INCOMING ATTACK! DEFEND!");
            setText("block parry dodge deflect counter protect guard shield barrier wall fortitude");
        }
    }, [phase]);

    // Game Logic
    useEffect(() => {
        if (input === text && text.length > 0) {
            playSound('correct');

            if (phase === 'shield') {
                setBossShield(s => s - 50);
                if (bossShield <= 50) { // Will be 0 after update
                    setPhase('attack');
                    playSound('win'); // Shield break sound
                }
                handleInput(''); // Reset for next phrase
            } else if (phase === 'attack') {
                setBossHp(h => h - 200);
                if (bossHp <= 200) {
                    // Victory Logic would go here
                }
                setPhase('defense'); // Boss retaliates
                handleInput('');
            } else if (phase === 'defense') {
                setPhase('shield'); // Cycle back
                handleInput('');
            }
        }
    }, [input, text, phase, bossShield, bossHp]);

    // Boss Timers
    useEffect(() => {
        if (isActive && !isFinished && bossHp > 0 && playerHp > 0) {
            const timer = setInterval(() => {
                if (phase === 'defense') {
                    setPlayerHp(h => Math.max(0, h - 5)); // DoT during defense phase
                    playSound('wrong');
                } else if (phase === 'shield') {
                    setBossShield(s => Math.min(100, s + 1)); // Regen
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase, isActive, isFinished, bossHp, playerHp]);

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh', textAlign: 'center' }}>

            <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>BOSS RAID</h1>

            {/* Boss Status */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid #ff0055' }}>
                <h2 style={{ color: '#ff0055', fontSize: '2rem', marginBottom: '1rem' }}>CYBER DEMON</h2>

                {/* Shield Bar */}
                {phase === 'shield' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#00f3ff' }}><Shield size={16} style={{ verticalAlign: 'middle' }} /> Shield</span>
                            <span>{bossShield}%</span>
                        </div>
                        <div style={{ width: '100%', height: '20px', background: 'rgba(0,243,255,0.2)' }}>
                            <div style={{ width: `${bossShield}%`, height: '100%', background: '#00f3ff' }} />
                        </div>
                    </div>
                )}

                {/* HP Bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#ff0055' }}><AlertTriangle size={16} style={{ verticalAlign: 'middle' }} /> Integrity</span>
                        <span>{bossHp} / 1000</span>
                    </div>
                    <div style={{ width: '100%', height: '40px', background: 'rgba(255,0,85,0.2)' }}>
                        <div style={{ width: `${(bossHp / 1000) * 100}%`, height: '100%', background: '#ff0055' }} />
                    </div>
                </div>
            </div>

            {/* Alert Message */}
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: phase === 'defense' ? '#ffaa00' : phase === 'attack' ? '#00ff00' : '#fff', marginBottom: '2rem', textShadow: '0 0 10px currentColor' }}>
                {message}
            </div>

            {/* Typing */}
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <TypingArea
                    text={text}
                    input={input}
                    stats={stats}
                    isActive={isActive}
                    isFinished={isFinished || bossHp <= 0 || playerHp <= 0}
                    onInput={handleInput}
                    onReset={resetTest}
                />
            </div>

            {/* Player Status */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem 3rem', borderColor: playerHp < 30 ? '#ff0055' : '#00f3ff' }}>
                    <Activity size={24} color={playerHp < 30 ? '#ff0055' : '#00f3ff'} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: '1rem' }}>{playerHp}%</span>
                </div>
            </div>

            {(bossHp <= 0 || playerHp <= 0) && (
                <div style={{ marginTop: '2rem' }}>
                    <h1 style={{ fontSize: '3rem', color: bossHp <= 0 ? '#00ff00' : '#ff0055' }}>
                        {bossHp <= 0 ? "BOSS DESTROYED" : "MISSION FAILED"}
                    </h1>
                    <Button variant="outline" onClick={() => router.push('/games')} style={{ marginTop: '1rem' }}>Leave Raid</Button>
                </div>
            )}
        </div>
    );
}
