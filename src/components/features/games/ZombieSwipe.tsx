"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Skull, Heart, Clock, Zap, RefreshCw } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

interface Zombie {
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
    isBoss?: boolean;
    hp?: number; // Boss HP
    maxHp?: number;
}

const WORDS_LIST = [
    "run", "hide", "survive", "escape", "fear", "dark", "night", "horror",
    "flesh", "blood", "bite", "infect", "virus", "dead", "alive", "brain",
    "scream", "panic", "chase", "hunt", "kill", "gore", "doom", "gloom",
    "shadow", "ghost", "witch", "demon", "beast", "monster", "evil", "cursed"
];

const DIFFICULTY_SETTINGS = {
    1: { spawnRate: 3000, speed: 1, label: "Easy (1 Zombie)" },
    2: { spawnRate: 2500, speed: 1.5, label: "Normal (3 Zombies)" },
    3: { spawnRate: 2000, speed: 2, label: "Hard (5 Zombies)" },
    4: { spawnRate: 1500, speed: 2.5, label: "Nightmare (Horde)" },
    5: { spawnRate: 1000, speed: 3.5, label: "Apocalypse" },
};

export default function ZombieSwipeGame() {
    const router = useRouter();
    const { playSound, playBGM, stopBGM } = useSound();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game State
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(100); // Health percentage
    const [input, setInput] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(2);
    const [survivalTime, setSurvivalTime] = useState(0);

    // Refs
    const zombiesRef = useRef<Zombie[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(100);
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const spawnRateRef = useRef(2000);
    const startTimeRef = useRef<number>(0);

    const spawnZombie = useCallback(() => {
        const isBoss = Math.random() > 0.95; // 5% chance for boss
        const text = isBoss ? "BOSS-" + Math.floor(Math.random() * 1000) : WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];

        const y = Math.random() * (window.innerHeight - 100) + 50;
        const speed = (Math.random() * 0.5 + 0.5) * DIFFICULTY_SETTINGS[difficulty].speed;

        zombiesRef.current.push({
            id: Date.now(),
            text,
            x: window.innerWidth + 50, // Start right
            y,
            speed: isBoss ? speed * 0.5 : speed,
            isBoss,
            hp: isBoss ? 5 : 1,
            maxHp: isBoss ? 5 : 1
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

        // Update Time
        if (startTimeRef.current > 0) {
            setSurvivalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }

        // Spawn
        if (timestamp - lastSpawnRef.current > spawnRateRef.current) {
            spawnZombie();
            lastSpawnRef.current = timestamp;
            // Ramp up difficulty slightly over time
            spawnRateRef.current = Math.max(500, DIFFICULTY_SETTINGS[difficulty].spawnRate - (scoreRef.current * 2));
        }

        const currentInput = input;

        zombiesRef.current.forEach((zombie, index) => {
            zombie.x -= zombie.speed;

            // Draw Zombie (Circle for now)
            ctx.beginPath();
            ctx.arc(zombie.x, zombie.y, zombie.isBoss ? 40 : 20, 0, Math.PI * 2);
            ctx.fillStyle = zombie.isBoss ? '#ff0000' : '#00ff00';
            ctx.fill();

            // Draw HP Bar for Boss
            if (zombie.isBoss) {
                ctx.fillStyle = 'red';
                ctx.fillRect(zombie.x - 30, zombie.y - 60, 60, 10);
                ctx.fillStyle = 'green';
                ctx.fillRect(zombie.x - 30, zombie.y - 60, 60 * (zombie.hp! / zombie.maxHp!), 10);
            }

            // Draw Text
            ctx.font = zombie.isBoss ? 'bold 30px "Courier New"' : '20px "Courier New"';
            ctx.fillStyle = '#fff';

            const matchedPart = zombie.text.startsWith(currentInput) ? currentInput : "";
            const remainingPart = zombie.text.startsWith(currentInput) ? zombie.text.substring(currentInput.length) : zombie.text;

            if (matchedPart) {
                ctx.fillStyle = '#ff0055'; // Highlight match
                ctx.fillText(matchedPart, zombie.x - 20, zombie.y + 50);
                const w = ctx.measureText(matchedPart).width;
                ctx.fillStyle = '#fff';
                ctx.fillText(remainingPart, zombie.x - 20 + w, zombie.y + 50);
            } else {
                ctx.fillText(zombie.text, zombie.x - 20, zombie.y + 50);
            }

            // Hit Player (Left Edge)
            if (zombie.x < 50) {
                zombiesRef.current.splice(index, 1);
                livesRef.current -= (zombie.isBoss ? 30 : 10); // Damage
                setLives(livesRef.current);
                playSound('wrong');

                if (currentInput && zombie.text.startsWith(currentInput)) {
                    setInput(''); // Clear input if target died
                }
            }
        });

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [spawnZombie, input, gameOver, difficulty, playSound]);

    useEffect(() => {
        if (gameStarted && !gameOver) {
            // playBGM('bgm_horror');
            const handleResize = () => {
                if (canvasRef.current) {
                    canvasRef.current.width = window.innerWidth;
                    canvasRef.current.height = window.innerHeight;
                }
            };

            window.addEventListener('resize', handleResize);
            handleResize();

            startTimeRef.current = Date.now();
            frameRef.current = requestAnimationFrame(gameLoop);

            return () => {
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(frameRef.current);
                stopBGM();
            };
        }
    }, [gameStarted, gameOver, gameLoop, stopBGM]);

    // Handle Input
    useEffect(() => {
        const checkInput = () => {
            // Find zombie matching input
            const matchIndex = zombiesRef.current.findIndex(z => z.text === input);
            if (matchIndex !== -1) {
                const zombie = zombiesRef.current[matchIndex];

                if (zombie.isBoss) {
                    zombie.hp! -= 1;
                    if (zombie.hp! <= 0) {
                        zombiesRef.current.splice(matchIndex, 1);
                        scoreRef.current += 50;
                        playSound('win'); // Boss kill sound
                    } else {
                        playSound('correct'); // Hit sound
                    }
                } else {
                    zombiesRef.current.splice(matchIndex, 1);
                    scoreRef.current += 10;
                    playSound('correct');
                }

                setScore(scoreRef.current);
                setInput('');
            }
        };
        checkInput();
    }, [input, playSound]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameOver || !gameStarted) return;

        if (e.key === 'Backspace') {
            setInput(prev => prev.slice(0, -1));
        } else if (e.key.length === 1 && /[a-z0-9\-]/i.test(e.key)) {
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
        setLives(100);
        setInput('');
        setSurvivalTime(0);
        zombiesRef.current = [];
        scoreRef.current = 0;
        livesRef.current = 100;
        lastSpawnRef.current = 0;
        spawnRateRef.current = DIFFICULTY_SETTINGS[difficulty].spawnRate;
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#1a0505' }}>

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', color: '#fff', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#ff0000' }}>
                        <Skull size={20} color="#ff0000" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{score}</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#ff0000' }}>
                        <Heart size={20} color="#ff0000" fill={lives > 0 ? "#ff0000" : "none"} />
                        <div style={{ width: '100px', height: '10px', background: '#330000', borderRadius: '5px' }}>
                            <div style={{ width: `${lives}%`, height: '100%', background: '#ff0000', borderRadius: '5px' }} />
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#ffaa00' }}>
                        <Clock size={20} color="#ffaa00" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{survivalTime}s</span>
                    </div>
                </div>

                {/* Input Visualization */}
                <div style={{ fontSize: '2rem', fontFamily: 'monospace', color: '#ff0000', textShadow: '0 0 10px #ff0000' }}>
                    {input}<span className="cursor">|</span>
                </div>

                <div>
                    <Button variant="ghost" onClick={() => router.push('/games')} style={{ pointerEvents: 'auto' }}>Exit</Button>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Start / Difficulty Screen */}
            {!gameStarted && !gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20, width: '450px', border: '2px solid #ff0000', boxShadow: '0 0 20px rgba(255,0,0,0.2)' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #ff0000, #550000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zombie Swipe</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Survive the horde.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {(Object.keys(DIFFICULTY_SETTINGS) as unknown as Array<1 | 2 | 3 | 4 | 5>).map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: difficulty === level ? '2px solid #ff0000' : '1px solid rgba(255,0,0,0.2)',
                                    background: difficulty === level ? 'rgba(255,0,0,0.2)' : 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{DIFFICULTY_SETTINGS[level].label}</span>
                                {difficulty === level && <Skull size={16} color="#ff0000" />}
                            </button>
                        ))}
                    </div>

                    <Button variant="primary" onClick={startGame} style={{ width: '100%', padding: '1rem', background: '#ff0000', borderColor: '#ff0000' }}>Start Survival</Button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 20, border: '2px solid #ff0000' }}>
                    <h1 style={{ fontSize: '3rem', color: '#ff0000', marginBottom: '1rem' }}>YOU DIED</h1>
                    <div style={{ marginBottom: '2rem', textAlign: 'left', display: 'inline-block' }}>
                        <p style={{ fontSize: '1.2rem' }}>Kills: <span style={{ color: '#fff', fontWeight: 'bold' }}>{score / 10}</span></p>
                        <p style={{ fontSize: '1.2rem' }}>Survived: <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{survivalTime}s</span></p>
                        <p style={{ fontSize: '1.2rem' }}>Difficulty: <span style={{ color: '#aaa', fontWeight: 'bold' }}>{DIFFICULTY_SETTINGS[difficulty].label}</span></p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button variant="primary" onClick={startGame} style={{ background: '#ff0000', borderColor: '#ff0000' }}><RefreshCw size={18} style={{ marginRight: '8px' }} /> Try Again</Button>
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
