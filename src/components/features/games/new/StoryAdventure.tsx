"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { BookOpen, Map, Compass } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import Typist from 'react-typist'; // We might not have this installed, so I'll write a simple typewriter effect hook/component

const HelperTypewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayed(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, 30);
        return () => clearInterval(timer);
    }, [text]);

    return <span>{displayed}</span>;
}

interface Scene {
    id: string;
    text: string;
    choices: { text: string, next: string, effect?: () => void }[];
    background?: string;
}

const STORY: Record<string, Scene> = {
    'start': {
        id: 'start',
        text: "You wake up in a cold, dim room. The air smells of ozone and rust. A single green terminal blinks in the corner.",
        choices: [
            { text: "examine terminal", next: "terminal" },
            { text: "search room", next: "room" }
        ]
    },
    'terminal': {
        id: 'terminal',
        text: "The terminal screen glows. 'SYSTEM OFFLINE. INSERT BOOT DISK.' There is no disk slot, only a keyboard.",
        choices: [
            { text: "type help", next: "help" },
            { text: "smash screen", next: "death_screen" },
            { text: "leave", next: "start" }
        ]
    },
    'room': {
        id: 'room',
        text: "You find a rusty pipe and a strange keycard labeled 'ACCESS'. There is a heavy door to the North.",
        choices: [
            { text: "open door", next: "door_locked" },
            { text: "keep searching", next: "hidden_vent" }
        ]
    },
    'door_locked': {
        id: 'door_locked',
        text: "The door is sealed tight. It requires a keycard.",
        choices: [
            { text: "use keycard", next: "corridor" },
            { text: "kick door", next: "start" }
        ]
    },
    'hidden_vent': {
        id: 'hidden_vent',
        text: "Behind a crate, you find a ventilation grunt. It's loose.",
        choices: [
            { text: "enter vent", next: "vent_maze" },
            { text: "go back", next: "room" }
        ]
    },
    'help': {
        id: 'help',
        text: "Terminal responds: 'COMMAND NOT RECOGNIZED. UNAUTHORIZED USER DETECTED. RELEASING NEUROTOXIN.'",
        choices: [
            { text: "run", next: "death_gas" },
            { text: "hold breath", next: "death_gas" }
        ]
    },
    'corridor': {
        id: 'corridor',
        text: "The door hisses open. A long corridor stretches out. You see lights at the end.",
        choices: [
            { text: "walk forward", next: "win" }
        ]
    },
    'vent_maze': {
        id: 'vent_maze',
        text: "You crawl through the tight space. Rats scurry nearby.",
        choices: [
            { text: "continue", next: "win" }
        ]
    },
    'death_screen': { id: 'death_screen', text: "You hurt your hand. Also, the noise attracted something. The end.", choices: [] },
    'death_gas': { id: 'death_gas', text: "The gas fills the room. Everything fades to black.", choices: [] },
    'win': { id: 'win', text: "You escape the facility into the blinding sunlight. You are free.", choices: [] }
};

export default function StoryAdventureGame() {
    const router = useRouter();
    const { playSound } = useSound();

    const [sceneId, setSceneId] = useState('start');
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<Scene[]>([]);

    const currentScene = STORY[sceneId];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const choice = currentScene.choices.find(c => c.text === input.toLowerCase().trim());

        if (choice) {
            playSound('correct');
            setHistory(h => [...h, currentScene]);
            setInput('');
            setSceneId(choice.next);
            if (choice.effect) choice.effect();
        } else {
            playSound('wrong');
            // Feedback?
        }
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '800px' }}>

            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>TEXT ADVENTURE</h1>

            <div className="glass-panel" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* History Log */}
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem', color: '#aaa' }}>
                    {history.map((s, i) => (
                        <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <p>{s.text}</p>
                        </div>
                    ))}
                </div>

                {/* Current Scene */}
                <div style={{ marginBottom: '2rem', fontSize: '1.2rem', lineHeight: '1.6', color: '#fff' }}>
                    <HelperTypewriter key={sceneId} text={currentScene.text} />
                </div>

                {/* Choices (Visual Hint, but user must type) */}
                {currentScene.choices.length > 0 ? (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {currentScene.choices.map((c, i) => (
                            <span key={i} style={{ padding: '0.2rem 0.8rem', border: '1px solid #00f3ff', borderRadius: '4px', color: '#00f3ff', fontSize: '0.9rem' }}>
                                {c.text}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginBottom: '2rem', color: sceneId === 'win' ? '#00ff00' : '#ff0055' }}>
                        {sceneId === 'win' ? "CONGRATULATIONS" : "GAME OVER"}
                    </div>
                )}

                {/* Input */}
                {currentScene.choices.length > 0 ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
                            <span style={{ color: '#00f3ff' }}>&gt;</span>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoFocus
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '1.2rem',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>
                    </form>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button variant="primary" onClick={() => { setSceneId('start'); setHistory([]); }}>Restart</Button>
                        <Button variant="ghost" onClick={() => router.push('/games')}>Exit</Button>
                    </div>
                )}

            </div>
        </div>
    );
}
