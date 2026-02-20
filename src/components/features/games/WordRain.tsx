"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Heart, Trophy, RefreshCw } from 'lucide-react';

interface Word {
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
}

const WORDS_LIST = [
    "react", "nextjs", "typescript", "javascript", "code", "debug", "compile", "deploy",
    "server", "client", "component", "hook", "state", "effect", "props", "context",
    "async", "await", "promise", "api", "database", "firebase", "mongodb", "vercel",
    "function", "variable", "const", "let", "import", "export", "class", "interface",
    "string", "number", "boolean", "array", "object", "null", "undefined", "void"
];

export default function WordRainGame() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [input, setInput] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game state refs for loop access to avoid closure staleness
    const wordsRef = useRef<Word[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const spawnRateRef = useRef(2000); // ms

    const spawnWord = useCallback(() => {
        const text = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
        const x = Math.random() * (window.innerWidth - 100) + 50; // Random X position
        const speed = 1 + (scoreRef.current / 50); // Increase speed with score

        wordsRef.current.push({
            id: Date.now(),
            text,
            x,
            y: -50, // Start above screen
            speed
        });
    }, []);

    const gameLoop = useCallback((timestamp: number) => {
        if (!canvasRef.current || livesRef.current <= 0) {
            if (livesRef.current <= 0) setGameOver(true);
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Spawn words
        if (timestamp - lastSpawnRef.current > spawnRateRef.current) {
            spawnWord();
            lastSpawnRef.current = timestamp;
            // Decrease spawn rate significantly to increase difficulty
            spawnRateRef.current = Math.max(500, 2000 - (scoreRef.current * 10));
        }

        // Update and draw words
        wordsRef.current.forEach((word, index) => {
            word.y += word.speed;

            // Draw word
            ctx.font = '24px "Courier New", monospace';
            ctx.fillStyle = '#00f3ff';
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 10;
            ctx.fillText(word.text, word.x, word.y);
            ctx.shadowBlur = 0; // Reset shadow

            // Check if word hit bottom
            if (word.y > canvasRef.current!.height) {
                wordsRef.current.splice(index, 1);
                livesRef.current -= 1;
                setLives(livesRef.current);
            }
        });

        // Highlight matching input
        if (input) {
            // Logic handled in useEffect for input
        }

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [spawnWord, input]);

    useEffect(() => {
        if (gameStarted && !gameOver) {
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
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(frameRef.current);
            };
        }
    }, [gameStarted, gameOver, gameLoop]);

    // Handle Input
    useEffect(() => {
        const checkInput = () => {
            const matchIndex = wordsRef.current.findIndex(w => w.text === input);
            if (matchIndex !== -1) {
                // Word matched!
                wordsRef.current.splice(matchIndex, 1);
                scoreRef.current += 10;
                setScore(scoreRef.current);
                setInput(''); // Clear input
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
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, gameStarted]);

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setLives(3);
        setInput('');
        wordsRef.current = [];
        scoreRef.current = 0;
        livesRef.current = 3;
        lastSpawnRef.current = 0;
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>

            {/* Game UI Layer */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', color: '#fff', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={24} color="#ffd700" />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Heart size={24} color="#ff0055" fill={lives > 0 ? "#ff0055" : "none"} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lives}</span>
                    </div>
                </div>

                {/* Current Input Display */}
                <div style={{ fontSize: '2rem', fontFamily: 'monospace', color: '#00f3ff', textShadow: '0 0 10px #00f3ff' }}>
                    {input}<span className="cursor">_</span>
                </div>

                <div>
                    <Button variant="ghost" onClick={() => router.push('/games')} style={{ pointerEvents: 'auto' }}>Exit</Button>
                </div>
            </div>

            {/* Canvas Layer */}
            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20 }}>
                    <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Word Rain</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Type the falling words before they hit the ground.</p>
                    <Button variant="primary" onClick={startGame} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>Start Game</Button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20 }}>
                    <h1 style={{ fontSize: '3rem', color: '#ff0055', marginBottom: '1rem' }}>Game Over</h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Final Score: {score}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button variant="primary" onClick={startGame}><RefreshCw size={18} style={{ marginRight: '8px' }} /> Play Again</Button>
                        <Button variant="outline" onClick={() => router.push('/games')}>Exit</Button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .cursor { animation: blink 1s step-end infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
}
