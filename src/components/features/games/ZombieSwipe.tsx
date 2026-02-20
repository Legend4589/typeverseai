"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Skull, Heart, RefreshCw, Target } from 'lucide-react';

interface Zombie {
    id: number;
    word: string;
    x: number;
    y: number;
    speed: number;
    scale: number;
}

const ZOMBIE_WORDS = [
    "brain", "run", "hide", "eat", "flesh", "ghoul", "walker", "biter",
    "undead", "virus", "infect", "survival", "horror", "escape", "doom",
    "decay", "grave", "swarm", "panic", "night", "blood", "gore", "scare",
    "dead", "flee", "hunt", "kill", "shot", "aim", "fire"
];

export default function ZombieSwipeGame() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [input, setInput] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const zombiesRef = useRef<Zombie[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const spawnRateRef = useRef(2500);

    const spawnZombie = useCallback(() => {
        const word = ZOMBIE_WORDS[Math.floor(Math.random() * ZOMBIE_WORDS.length)];
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Spawn from right side
        const y = Math.random() * (ctx.canvas.height - 100) + 50;
        const speed = 0.5 + (scoreRef.current / 100);

        zombiesRef.current.push({
            id: Date.now(),
            word,
            x: ctx.canvas.width,
            y,
            speed,
            scale: 1
        });
    }, []);

    const gameLoop = useCallback((timestamp: number) => {
        if (!canvasRef.current || livesRef.current <= 0) {
            if (livesRef.current <= 0) setGameOver(true);
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Spawn logic
        if (timestamp - lastSpawnRef.current > spawnRateRef.current) {
            spawnZombie();
            lastSpawnRef.current = timestamp;
            spawnRateRef.current = Math.max(800, 2500 - (scoreRef.current * 20));
        }

        // Update & Draw
        zombiesRef.current.forEach((zombie, index) => {
            zombie.x -= zombie.speed;

            // Draw Zombie (Simple Circle Representation for now with Icon)
            ctx.fillStyle = '#ff0055';
            ctx.beginPath();
            ctx.arc(zombie.x, zombie.y, 25, 0, Math.PI * 2);
            ctx.fill();

            // Draw Word
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(zombie.word, zombie.x, zombie.y - 35);

            // Highlight matched part
            if (input && zombie.word.startsWith(input)) {
                ctx.fillStyle = '#00ff00';
                ctx.fillText(input, zombie.x - (ctx.measureText(zombie.word).width / 2) + (ctx.measureText(input).width / 2), zombie.y - 35);
            }

            // Check collision (reached left side)
            if (zombie.x < 50) {
                zombiesRef.current.splice(index, 1);
                livesRef.current -= 1;
                setLives(livesRef.current);
            }
        });

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [spawnZombie, input]);

    // Input Handling
    useEffect(() => {
        const checkInput = () => {
            // Find target zombie (closest match)
            const targetIndex = zombiesRef.current.findIndex(z => z.word === input);

            if (targetIndex !== -1) {
                // Kill zombie
                zombiesRef.current.splice(targetIndex, 1);
                scoreRef.current += 100;
                setScore(scoreRef.current);
                setInput('');
            }
        };
        checkInput();
    }, [input]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameOver || !gameStarted) return;

        if (e.key === 'Backspace') {
            setInput(prev => prev.slice(0, -1));
        } else if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
            setInput(prev => prev + e.key.toLowerCase());
        }
    };

    useEffect(() => {
        if (gameStarted && !gameOver) {
            window.addEventListener('keydown', handleKeyDown);

            const handleResize = () => {
                if (canvasRef.current) {
                    canvasRef.current.width = window.innerWidth;
                    canvasRef.current.height = window.innerHeight;
                }
            };
            window.addEventListener('resize', handleResize);
            handleResize();

            frameRef.current = requestAnimationFrame(gameLoop);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(frameRef.current);
            };
        }
    }, [gameStarted, gameOver, gameLoop]);

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setLives(3);
        setInput('');
        zombiesRef.current = [];
        scoreRef.current = 0;
        livesRef.current = 3;
        lastSpawnRef.current = 0;
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#1a0505' }}>

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', color: '#fff', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={24} color="#ffd700" />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Heart size={24} color="#ff0055" fill={lives > 0 ? "#ff0055" : "none"} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lives}</span>
                    </div>
                </div>
                <div style={{ fontSize: '2rem', fontFamily: 'monospace', color: '#ff0055', textShadow: '0 0 10px #ff0055' }}>
                    {input}<span className="cursor">_</span>
                </div>
                <div>
                    <Button variant="ghost" onClick={() => router.push('/games')} style={{ pointerEvents: 'auto' }}>Exit</Button>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20, border: '1px solid #ff0055' }}>
                    <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(to right, #ff0055, #ff5500)' }}>Zombie Swipe</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Type the words to kill zombies before they reach left side.</p>
                    <Button variant="primary" onClick={startGame} style={{ fontSize: '1.2rem', padding: '1rem 3rem', background: '#ff0055', borderColor: '#ff0055' }}>Start Survival</Button>
                </div>
            )}

            {/* Game Over */}
            {gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20 }}>
                    <h1 style={{ fontSize: '3rem', color: '#ff0055', marginBottom: '1rem' }}>You Died</h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Final Score: {score}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button variant="primary" onClick={startGame} style={{ background: '#ff0055', borderColor: '#ff0055' }}><RefreshCw size={18} style={{ marginRight: '8px' }} /> Restart</Button>
                        <Button variant="outline" onClick={() => router.push('/games')}>Exit</Button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .cursor { animation: blink 0.1s step-end infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
}
