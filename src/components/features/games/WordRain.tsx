"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Heart, Trophy, RefreshCw, Zap } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

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

const DIFFICULTY_SETTINGS = {
    1: { spawnRate: 2500, speedMulti: 0.8, label: "Very Easy" },
    2: { spawnRate: 2000, speedMulti: 1.0, label: "Easy" },
    3: { spawnRate: 1500, speedMulti: 1.2, label: "Normal" },
    4: { spawnRate: 1000, speedMulti: 1.5, label: "Hard" },
    5: { spawnRate: 800, speedMulti: 2.0, label: "Extreme" },
};

export default function WordRainGame() {
    const router = useRouter();
    const { playSound, playBGM, stopBGM } = useSound();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game State
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [input, setInput] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    const activeWordIndexRef = useRef<number>(-1);

    // Refs
    const wordsRef = useRef<Word[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const spawnRateRef = useRef(2000);

    const spawnWord = useCallback(() => {
        const text = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const speed = (1 + (scoreRef.current / 100)) * DIFFICULTY_SETTINGS[difficulty].speedMulti;

        wordsRef.current.push({
            id: Date.now(),
            text,
            x,
            y: -50,
            speed
        });
    }, [difficulty]);

    const gameLoop = useCallback((timestamp: number) => {
        if (!canvasRef.current || livesRef.current <= 0) {
            if (livesRef.current <= 0 && !gameOver) {
                setGameOver(true);
                playSound('lose');
            }
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Spawn
        if (timestamp - lastSpawnRef.current > spawnRateRef.current) {
            spawnWord();
            lastSpawnRef.current = timestamp;
            // Adaptive difficulty
            const baseRate = DIFFICULTY_SETTINGS[difficulty].spawnRate;
            spawnRateRef.current = Math.max(500, baseRate - (scoreRef.current * 5));
        }

        const currentInput = input;

        wordsRef.current.forEach((word, index) => {
            word.y += word.speed;

            ctx.font = 'bold 24px "Courier New", monospace';

            // Highlight logic
            if (index === activeWordIndexRef.current) {
                const matchedPart = word.text.substring(0, currentInput.length);
                const remainingPart = word.text.substring(currentInput.length);

                ctx.fillStyle = '#00ff00';
                ctx.fillText(matchedPart, word.x, word.y);

                const matchWidth = ctx.measureText(matchedPart).width;
                ctx.fillStyle = '#00f3ff';
                ctx.fillText(remainingPart, word.x + matchWidth, word.y);

                // Active Target Indicator
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(word.x - 10, word.y - 10);
                ctx.lineTo(word.x - 5, word.y - 10);
                ctx.stroke();

            } else {
                ctx.fillStyle = 'rgba(0, 243, 255, 0.7)';
                ctx.shadowColor = '#00f3ff';
                ctx.shadowBlur = 5;
                ctx.fillText(word.text, word.x, word.y);
                ctx.shadowBlur = 0;
            }

            // Hit bottom
            if (word.y > canvasRef.current!.height) {
                wordsRef.current.splice(index, 1);
                livesRef.current -= 1;
                setLives(livesRef.current);
                setCombo(0); // Reset combo on miss
                playSound('wrong');

                if (index === activeWordIndexRef.current) {
                    setInput('');
                    activeWordIndexRef.current = -1;
                } else if (index < activeWordIndexRef.current) {
                    activeWordIndexRef.current -= 1;
                }
            }
        });

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [spawnWord, input, gameOver, difficulty, playSound]);

    useEffect(() => {
        if (gameStarted && !gameOver) {
            // playBGM('bgm_rain'); 
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
                stopBGM();
            };
        }
    }, [gameStarted, gameOver, gameLoop, stopBGM]);

    // Input Handling
    useEffect(() => {
        const checkInput = () => {
            if (activeWordIndexRef.current === -1) {
                if (input.length > 0) {
                    // Auto-target closest to bottom matching
                    let bestIndex = -1;
                    let maxY = -1000;

                    wordsRef.current.forEach((w, i) => {
                        if (w.text.startsWith(input)) {
                            if (w.y > maxY) {
                                maxY = w.y;
                                bestIndex = i;
                            }
                        }
                    });

                    if (bestIndex !== -1) {
                        activeWordIndexRef.current = bestIndex;
                        playSound('click'); // Feedback for lock-on
                    }
                }
            } else {
                const activeWord = wordsRef.current[activeWordIndexRef.current];
                if (!activeWord || !activeWord.text.startsWith(input)) {
                    activeWordIndexRef.current = -1;
                    setCombo(0);
                    playSound('wrong');
                } else if (activeWord.text === input) {
                    // Word Complete
                    wordsRef.current.splice(activeWordIndexRef.current, 1);

                    // Score & Combo
                    const comboBonus = Math.min(50, combo * 5);
                    scoreRef.current += (10 + comboBonus);
                    setScore(scoreRef.current);

                    setCombo(c => {
                        const newCombo = c + 1;
                        if (newCombo > maxCombo) setMaxCombo(newCombo);
                        return newCombo;
                    });

                    playSound('correct');
                    setInput('');
                    activeWordIndexRef.current = -1;
                } else {
                    playSound('click');
                }
            }
        };
        checkInput();
    }, [input, combo, maxCombo, playSound]);

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
        setCombo(0);
        setMaxCombo(0);
        wordsRef.current = [];
        scoreRef.current = 0;
        livesRef.current = 3;
        lastSpawnRef.current = 0;
        spawnRateRef.current = DIFFICULTY_SETTINGS[difficulty].spawnRate;
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', color: '#fff', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={20} color="#ffd700" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{score}</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Heart size={20} color="#ff0055" fill={lives > 0 ? "#ff0055" : "none"} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{lives}</span>
                    </div>
                </div>

                {/* Combo Indicator */}
                <div style={{ transform: `scale(${1 + Math.min(0.5, combo * 0.05)})`, transition: 'transform 0.1s' }}>
                    {combo > 1 && (
                        <div style={{ color: '#ffd700', textShadow: '0 0 10px #ffd700', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {combo}x COMBO!
                        </div>
                    )}
                </div>

                <div>
                    <Button variant="ghost" onClick={() => router.push('/games')} style={{ pointerEvents: 'auto' }}>Exit</Button>
                </div>
            </div>

            {/* Input Visualization */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '3rem',
                fontFamily: 'monospace',
                color: '#fff',
                textShadow: '0 0 20px rgba(0,243,255,0.5)',
                zIndex: 10
            }}>
                {input}<span className="cursor">_</span>
            </div>

            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Start / Difficulty Screen */}
            {!gameStarted && !gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20, width: '400px' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Word Rain</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Select Difficulty</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {(Object.keys(DIFFICULTY_SETTINGS) as unknown as Array<1 | 2 | 3 | 4 | 5>).map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: difficulty === level ? '2px solid #00f3ff' : '1px solid rgba(255,255,255,0.1)',
                                    background: difficulty === level ? 'rgba(0,243,255,0.1)' : 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{DIFFICULTY_SETTINGS[level].label}</span>
                                {difficulty === level && <Zap size={16} color="#00f3ff" />}
                            </button>
                        ))}
                    </div>

                    <Button variant="primary" onClick={startGame} style={{ width: '100%', padding: '1rem' }}>Start Game</Button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20 }}>
                    <h1 style={{ fontSize: '3rem', color: '#ff0055', marginBottom: '1rem' }}>Game Over</h1>
                    <div style={{ marginBottom: '2rem', textAlign: 'left', display: 'inline-block' }}>
                        <p style={{ fontSize: '1.2rem' }}>Final Score: <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>{score}</span></p>
                        <p style={{ fontSize: '1.2rem' }}>Max Combo: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{maxCombo}</span></p>
                        <p style={{ fontSize: '1.2rem' }}>Difficulty: <span style={{ color: '#aaa', fontWeight: 'bold' }}>{DIFFICULTY_SETTINGS[difficulty].label}</span></p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button variant="primary" onClick={startGame}><RefreshCw size={18} style={{ marginRight: '8px' }} /> Retry</Button>
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
