"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Crosshair, Target, Zap } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

interface TargetWord {
    id: number;
    text: string;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    isGolden?: boolean;
}

const WORDS = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu"];

export default function WordSniperGame() {
    const router = useRouter();
    const { playSound } = useSound();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game State
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [input, setInput] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Refs
    const targetsRef = useRef<TargetWord[]>([]);
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);

    // Spawn Logic
    const spawnTarget = useCallback(() => {
        const text = WORDS[Math.floor(Math.random() * WORDS.length)];
        const isGolden = Math.random() > 0.8;

        targetsRef.current.push({
            id: Date.now(),
            text,
            x: Math.random() < 0.5 ? -100 : window.innerWidth + 100, // Spawn from sides
            y: Math.random() * (window.innerHeight - 200) + 100,
            speedX: (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 2 + 1),
            speedY: (Math.random() - 0.5) * 1, // Slight drift
            isGolden
        });
    }, []);

    // Game Loop
    const gameLoop = useCallback((timestamp: number) => {
        if (!canvasRef.current || timeLeft <= 0) {
            if (timeLeft <= 0 && !gameOver) {
                setGameOver(true);
                playSound('win');
            }
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Spawn
        if (timestamp - lastSpawnRef.current > 1500) { // Spawn every 1.5s
            spawnTarget();
            lastSpawnRef.current = timestamp;
        }

        const currentInput = input;

        targetsRef.current.forEach((t, i) => {
            t.x += t.speedX;
            t.y += t.speedY;

            // Bounce vertically
            if (t.y < 50 || t.y > canvasRef.current!.height - 50) t.speedY *= -1;

            // Despawn if off screen
            if ((t.speedX > 0 && t.x > canvasRef.current!.width + 100) ||
                (t.speedX < 0 && t.x < -100)) {
                // If it wasn't shot, small penalty?
                targetsRef.current.splice(i, 1);
            }

            // Draw Target Crosshair UI
            ctx.strokeStyle = t.text.startsWith(currentInput) ? '#00f3ff' : 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;

            // Circle
            ctx.beginPath();
            ctx.arc(t.x, t.y, 40, 0, Math.PI * 2);
            ctx.stroke();

            // Cross
            ctx.beginPath();
            ctx.moveTo(t.x - 50, t.y);
            ctx.lineTo(t.x + 50, t.y);
            ctx.moveTo(t.x, t.y - 50);
            ctx.lineTo(t.x, t.y + 50);
            ctx.stroke();

            // Text
            ctx.font = '20px "Courier New"';
            ctx.fillStyle = t.isGolden ? '#ffd700' : '#fff';
            ctx.fillText(t.text, t.x - 20, t.y - 50);

            // Matched Part
            if (t.text.startsWith(currentInput)) {
                ctx.fillStyle = '#ff0055';
                ctx.fillText(currentInput, t.x - 20, t.y - 50);

                // Laser line from center to target if locked on
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,0,85,0.5)';
                ctx.moveTo(canvasRef.current!.width / 2, canvasRef.current!.height);
                ctx.lineTo(t.x, t.y);
                ctx.stroke();
            }
        });

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [spawnTarget, input, gameOver, timeLeft, playSound]);

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

            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);

            return () => {
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(frameRef.current);
                clearInterval(timer);
            };
        }
    }, [gameStarted, gameOver, gameLoop]);

    // Input
    useEffect(() => {
        // Auto-fire check
        const targetIndex = targetsRef.current.findIndex(t => t.text === input);
        if (targetIndex !== -1) {
            const t = targetsRef.current[targetIndex];
            // HIT!
            playSound('correct'); // Should be a gunshot sound
            setScore(s => s + (t.isGolden ? 500 : 100));
            targetsRef.current.splice(targetIndex, 1);
            setInput('');
        }
    }, [input, playSound]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameOver || !gameStarted) return;
        if (e.key === 'Backspace') setInput(prev => prev.slice(0, -1));
        else if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
            setInput(prev => prev + e.key.toLowerCase());
            playSound('click');
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
        setTimeLeft(60);
        setInput('');
        targetsRef.current = [];
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', cursor: 'crosshair' }}>

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', color: '#fff', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#00f3ff' }}>
                        <Target size={20} color="#00f3ff" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{score}</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#fff' }}>
                        <Zap size={20} color="#fff" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{timeLeft}s</span>
                    </div>
                </div>

                <div style={{ fontSize: '2rem', fontFamily: 'monospace', color: '#00f3ff', textShadow: '0 0 10px #00f3ff' }}>
                    [{input}]
                </div>

                <Button variant="ghost" onClick={() => router.push('/games')} style={{ pointerEvents: 'auto' }}>Exit Mission</Button>
            </div>

            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Scope Overlay Effect */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'radial-gradient(circle, transparent 50%, #000 100%)' }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '2px', height: '20px', background: 'rgba(255,0,0,0.5)', transform: 'translate(-50%, -50%)' }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '20px', height: '2px', background: 'rgba(255,0,0,0.5)', transform: 'translate(-50%, -50%)' }}></div>

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20, width: '400px', border: '1px solid #00f3ff' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#00f3ff' }}>WORD SNIPER</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Eliminate targets before they escape.</p>
                    <Button variant="primary" onClick={startGame} style={{ width: '100%', padding: '1rem', background: '#00f3ff', color: '#000', fontWeight: 'bold' }}>ENGAGE</Button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20 }}>
                    <h1 style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem' }}>MISSION COMPLETE</h1>
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ fontSize: '1.5rem' }}>Construct Confirmed: <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>{score}</span></p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button variant="primary" onClick={startGame}>Re-Engage</Button>
                        <Button variant="outline" onClick={() => router.push('/games')}>Debrief</Button>
                    </div>
                </div>
            )}

        </div>
    );
}
