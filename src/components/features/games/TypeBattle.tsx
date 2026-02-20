"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Swords, Share2 } from 'lucide-react';
import TypingArea from '@/components/features/typing/TypingArea';
import { useTypingTest } from '@/hooks/useTypingTest';

export default function TypeBattleGame() {
    const router = useRouter();
    const [playerHealth, setPlayerHealth] = useState(100);
    const [enemyHealth, setEnemyHealth] = useState(100);
    const [battleLog, setBattleLog] = useState<string[]>([]);

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

    // Bot damage logic
    useEffect(() => {
        if (isActive && !isFinished) {
            const botInterval = setInterval(() => {
                // Bot hits for random damage every 2 seconds
                const damage = Math.floor(Math.random() * 10) + 5;
                setPlayerHealth(h => Math.max(0, h - damage));
                setBattleLog(prev => [`Enemy hits you for ${damage} damage!`, ...prev.slice(0, 4)]);
            }, 2000);
            return () => clearInterval(botInterval);
        }
    }, [isActive, isFinished]);

    // Player damage logic (on word completion, maybe?)
    // For now, let's tie it to raw WPM updates or milestones.
    // Simpler: every 10 chars typed correctly deals damage.
    const lastInputLen = useRef(0);
    useEffect(() => {
        if (input.length > lastInputLen.current) {
            const char = input[input.length - 1];
            const correctChar = text[input.length - 1];
            if (char === correctChar) {
                // Crit chance based on accuracy?
                // Small damage per char
                setEnemyHealth(h => Math.max(0, h - 1));
            }
        }
        lastInputLen.current = input.length;
    }, [input, text]);

    // Check game over
    useEffect(() => {
        if (playerHealth <= 0) {
            // Loss
            setBattleLog(prev => [`You were defeated!`, ...prev]);
            // Force stop test?
        }
        if (enemyHealth <= 0) {
            // Win
            setBattleLog(prev => [`You defeated the enemy!`, ...prev]);
        }
    }, [playerHealth, enemyHealth]);

    // Import useRef
    // Ref cleanup

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>

                {/* Player Stats */}
                <div className="glass-panel" style={{ padding: '2rem', width: '300px', textAlign: 'center', borderTop: '4px solid #00f3ff' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>You</h2>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: playerHealth < 30 ? '#ff0055' : '#00f3ff' }}>
                        {playerHealth}%
                    </div>
                </div>

                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)' }}>VS</div>

                {/* Enemy Stats */}
                <div className="glass-panel" style={{ padding: '2rem', width: '300px', textAlign: 'center', borderTop: '4px solid #ff0055' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Boss</h2>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: enemyHealth < 30 ? '#ffaa00' : '#ff0055' }}>
                        {enemyHealth}%
                    </div>
                </div>
            </div>

            {/* Battle Log */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', height: '100px', overflow: 'hidden' }}>
                {battleLog.map((log, i) => (
                    <div key={i} style={{ opacity: 1 - (i * 0.2), marginBottom: '0.5rem' }}>{log}</div>
                ))}
            </div>

            {/* Typing Area */}
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <TypingArea
                    text={text}
                    input={input}
                    stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft }}
                    isActive={isActive || (playerHealth > 0 && enemyHealth > 0 && !isFinished)} // Keep active if battle ongoing
                    isFinished={isFinished || playerHealth <= 0 || enemyHealth <= 0}
                    onInput={handleInput}
                    onReset={() => {
                        resetTest();
                        setPlayerHealth(100);
                        setEnemyHealth(100);
                        setBattleLog([]);
                    }}
                />
            </div>

            {(playerHealth <= 0 || enemyHealth <= 0 || isFinished) && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {playerHealth > 0 && enemyHealth <= 0 ? 'VICTORY!' : 'DEFEAT'}
                    </h1>
                    <Button variant="outline" onClick={() => router.push('/games')}>Exit Arena</Button>
                </div>
            )}
        </div>
    );
}
