"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Shield, Skull, Zap } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import { generateWords } from '@/lib/utils'; // Assuming or mocking

const WORDS = ["defend", "guard", "shield", "protect", "wall", "tower", "laser", "cannon", "blast", "shot", "fire", "ice", "bolt", "shock", "boom", "zap"];

interface Enemy {
    id: number;
    text: string;
    lane: number; // 0, 1, 2, 3
    y: number;
    speed: number;
    hp: number;
    maxHp: number;
}

export default function TowerDefenseGame() {
    const router = useRouter();
    const { playSound } = useSound();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State
    const [baseHp, setBaseHp] = useState(100);
    const [score, setScore] = useState(0);
    const [input, setInput] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [start, setStart] = useState(false);
    const [wave, setWave] = useState(1);

    // Refs
    const enemiesRef = useRef<Enemy[]>([]);
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);

    const spawnEnemy = useCallback(() => {
        const lane = Math.floor(Math.random() * 4);
        const text = WORDS[Math.floor(Math.random() * WORDS.length)];
        const isTank = Math.random() > 0.8;

        enemiesRef.current.push({
            id: Date.now(),
            text,
            lane,
            y: -50,
            speed: isTank ? 0.5 : 1 + (wave * 0.1),
            hp: isTank ? 3 : 1,
            maxHp: isTank ? 3 : 1
        });
    }, [wave]);

    const gameLoop = useCallback((timestamp: number) => {
        if (!canvasRef.current || baseHp <= 0) {
            if (baseHp <= 0 && !gameOver) {
                setGameOver(true);
                playSound('lose');
            }
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const laneWidth = width / 4;

        ctx.clearRect(0, 0, width, height);

        // Draw Lanes
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(i * laneWidth, 0);
            ctx.lineTo(i * laneWidth, height);
            ctx.stroke();
        }

        // Draw Base
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.fillRect(0, height - 100, width, 100);
        ctx.strokeStyle = '#00f3ff';
        ctx.strokeRect(0, height - 100, width, 100);

        // Spawn
        if (timestamp - lastSpawnRef.current > Math.max(500, 2000 - (wave * 100))) {
            spawnEnemy();
            lastSpawnRef.current = timestamp;
        }

        const currentInput = input;

        enemiesRef.current.forEach((enemy, index) => {
            enemy.y += enemy.speed;

            const x = (enemy.lane * laneWidth) + (laneWidth / 2);

            // Draw Enemy
            ctx.fillStyle = enemy.hp > 1 ? '#ffaa00' : '#ff0055';
            ctx.beginPath();
            ctx.arc(x, enemy.y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.font = '16px "Inter", sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';

            if (enemy.text.startsWith(currentInput) && currentInput.length > 0) {
                // Highlight logic could be complex if multiple enemies have same word prefix
                // For simplicity, we only highlight if this specific enemy matches fully or partially for now
                // Detailed targeting usually requires "locking" onto one enemy.
                // We'll implement lock-on logic in input handler, here just render.
                ctx.fillStyle = '#fff'; // Render normally, highlighting handled by "Lock On" visual
            }
            ctx.fillText(enemy.text, x, enemy.y - 30);

            // HP Bar
            if (enemy.maxHp > 1) {
                ctx.fillStyle = 'red';
                ctx.fillRect(x - 15, enemy.y - 50, 30, 5);
                ctx.fillStyle = 'green';
                ctx.fillRect(x - 15, enemy.y - 50, 30 * (enemy.hp / enemy.maxHp), 5);
            }

            // Hit Base
            if (enemy.y > height - 100) {
                enemiesRef.current.splice(index, 1);
                setBaseHp(h => Math.max(0, h - 10));
                playSound('wrong');
            }
        });

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [baseHp, input, wave, playSound, spawnEnemy]);


    useEffect(() => {
        if (start && !gameOver) {
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
    }, [start, gameOver, gameLoop]);

    // Input Handling with Lock-On
    const activeEnemyIndex = useRef(-1);

    useEffect(() => {
        const checkInput = () => {
            if (activeEnemyIndex.current === -1) {
                // Find new target
                const idx = enemiesRef.current.findIndex(e => e.text.startsWith(input) && input.length > 0);
                if (idx !== -1) activeEnemyIndex.current = idx;
            }

            if (activeEnemyIndex.current !== -1) {
                const enemy = enemiesRef.current[activeEnemyIndex.current];
                if (!enemy) { activeEnemyIndex.current = -1; return; }

                if (enemy.text === input) {
                    // Kill
                    enemy.hp -= 1;
                    if (enemy.hp <= 0) {
                        enemiesRef.current.splice(activeEnemyIndex.current, 1);
                        setScore(s => s + 50);
                        playSound('correct');
                    } else {
                        // Resisted (Tank) - Reset input but keep lock? Or clear input?
                        // For typing games, usually you clear input and re-type same word or new word
                        playSound('correct');
                    }
                    setInput('');
                    activeEnemyIndex.current = -1;
                } else if (!enemy.text.startsWith(input)) {
                    // Missed / Typo
                    setInput('');
                    activeEnemyIndex.current = -1;
                    playSound('wrong');
                }
            }
        };
        checkInput();
    }, [input, playSound]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!start || gameOver) return;
        if (e.key === 'Backspace') setInput(prev => prev.slice(0, -1));
        else if (e.key.length === 1 && /[a-z]/i.test(e.key)) setInput(prev => prev + e.key.toLowerCase());
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [start, gameOver]);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#050510' }}>

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: '2rem', color: '#fff', zIndex: 10 }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>Score: {score}</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>Wave: {wave}</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', color: baseHp < 30 ? 'red' : 'cyan' }}>Base Integrity: {baseHp}%</div>
            </div>
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                <Button variant="ghost" onClick={() => router.push('/games')}>Retreat</Button>
            </div>

            {/* Input Vis */}
            <div style={{ position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', color: '#00f3ff', fontSize: '2rem', fontWeight: 'bold' }}>
                {input}
            </div>

            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {!start && !gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', color: '#00f3ff' }}>TOWER DEFENSE</h1>
                    <p style={{ marginBottom: '2rem' }}>Defend the base from incoming threats.</p>
                    <Button variant="primary" onClick={() => { setStart(true); setBaseHp(100); setScore(0); enemiesRef.current = []; }}>Initialize Defense</Button>
                </div>
            )}

            {gameOver && (
                <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', color: '#ff0055' }}>BASE DESTROYED</h1>
                    <p>Final Score: {score}</p>
                    <div style={{ marginTop: '2rem' }}>
                        <Button variant="primary" onClick={() => { setStart(true); setGameOver(false); setBaseHp(100); setScore(0); enemiesRef.current = []; }}>Reboot System</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
