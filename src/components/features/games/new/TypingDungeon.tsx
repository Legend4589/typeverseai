"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { DoorOpen, Ghost, Sword, Shield, Key, Crown, Skull } from 'lucide-react';
import TypingArea from '@/components/features/typing/TypingArea';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useSound } from '@/context/SoundContext';


const ENCOUNTERS = [
    { type: 'enemy', name: 'Goblin Scout', hp: 50, words: 10, icon: Ghost, color: '#ffaa00' },
    { type: 'enemy', name: 'Orc Warrior', hp: 100, words: 20, icon: Skull, color: '#ff0055' },
    { type: 'treasure', name: 'Ancient Chest', hp: 30, words: 5, icon: Key, color: '#ffd700' },
    { type: 'boss', name: 'Dungeon Master', hp: 200, words: 50, icon: Crown, color: '#8000ff' }
] as const;



export default function TypingDungeonGame() {
    const router = useRouter();
    const { playSound } = useSound();

    // State
    const [floor, setFloor] = useState(1);
    const [playerHp, setPlayerHp] = useState(100);
    const [encounterIndex, setEncounterIndex] = useState(0);
    const [log, setLog] = useState<string[]>(["You enter the dark dungeon..."]);

    const currentEncounter = ENCOUNTERS[encounterIndex % ENCOUNTERS.length];

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

    // Init Encounter
    useEffect(() => {
        // Create a sentence for the duel
        const words = Array.from({ length: currentEncounter.words }, () => "attack").join(" ");
        // Real random words would be better
        setText("strike with precision and speed to defeat the enemy");
    }, [encounterIndex]);

    // Check progress
    useEffect(() => {
        if (isFinished || (input.length === text.length && text.length > 0)) {
            // Encounter Cleared
            playSound('correct');
            setLog(prev => [`You defeated ${currentEncounter.name}!`, ...prev]);

            // Next Floor
            setTimeout(() => {
                setFloor(f => f + 1);
                setEncounterIndex(i => i + 1);
                resetTest();
            }, 1000);
        }
    }, [isFinished, input, text, playSound]);

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem' }}>Typing Dungeon</h1>
                <p className="text-muted">Floor {floor}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

                {/* Visual Scene */}
                <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <currentEncounter.icon size={120} color={currentEncounter.color} style={{ filter: 'drop-shadow(0 0 20px currentColor)' }} />
                    <h2 style={{ marginTop: '2rem', color: currentEncounter.color }}>{currentEncounter.name}</h2>
                    <div style={{ marginTop: '1rem', width: '200px', height: '10px', background: '#333', borderRadius: '5px' }}>
                        <div style={{ width: '100%', height: '100%', background: currentEncounter.color, borderRadius: '5px' }}></div>
                    </div>
                </div>

                {/* Log & Action */}
                <div>
                    <div className="glass-panel" style={{ height: '200px', marginBottom: '2rem', overflowY: 'auto', padding: '1rem' }}>
                        {log.map((l, i) => (
                            <div key={i} style={{ marginBottom: '0.5rem', opacity: 1 - i * 0.1 }}>{l}</div>
                        ))}
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <TypingArea
                            text={text}
                            input={input}
                            stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft: 0 }}
                            isActive={isActive}
                            isFinished={isFinished}
                            onInput={handleInput}
                            onReset={resetTest}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Button variant="ghost" onClick={() => router.push('/games')}>Flee Dungeon</Button>
            </div>
        </div>
    );
}
