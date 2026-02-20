"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { Swords, Zap, Flag, Trophy, Skull } from 'lucide-react';
import TypingArea from '@/components/features/typing/TypingArea';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useSound } from '@/context/SoundContext';

import { submitScore } from '@/actions/score-submission';

// Helper to generate random words (normally would use a lib or API)
const RANDOM_WORDS = [
    "battle", "speed", "power", "glory", "champion", "victory", "defeat", "warrior", "legend", "myth",
    "strike", "defense", "attack", "shield", "sword", "magic", "spell", "cast", "summon", "minion"
];

const generateRandomText = (count: number) => {
    return Array.from({ length: count }, () => RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)]).join(' ');
};

export default function TypeBattleGame() {
    const router = useRouter();
    const { playSound, playBGM, stopBGM } = useSound();

    // Game Modes
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [gameText, setGameText] = useState("");

    // Race State
    const [playerProgress, setPlayerProgress] = useState(0);
    const [enemyProgress, setEnemyProgress] = useState(0);
    const [playerHealth, setPlayerHealth] = useState(100);
    const [enemyHealth, setEnemyHealth] = useState(100);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [combo, setCombo] = useState(0);

    const {
        text,
        input,
        timeLeft,
        isActive,
        isFinished,
        stats,
        keystrokeLogs,
        handleInput,
        resetTest
    } = useTypingTest(60);

    // Initialize Game
    useEffect(() => {
        // playBGM('bgm_racing'); // Auto-play might be blocked, best to do on interaction
        return () => stopBGM();
    }, []);

    // Custom Reset to handle mode toggling
    const handleReset = () => {
        resetTest();
        setPlayerHealth(100);
        setEnemyHealth(100);
        setPlayerProgress(0);
        setEnemyProgress(0);
        setBattleLog([]);
        setCombo(0);
    };

    // Bot Logic & Progress
    useEffect(() => {
        if (isActive && !isFinished) {
            // Bot Progress
            const botInterval = setInterval(() => {
                setEnemyProgress(prev => Math.min(100, prev + (Math.random() * 1.5))); // Random speed

                // Random damage event
                if (Math.random() > 0.8) {
                    const damage = Math.floor(Math.random() * 8) + 2;
                    setPlayerHealth(h => Math.max(0, h - damage));
                    setBattleLog(prev => [`Enemy strikes! -${damage} HP`, ...prev.slice(0, 4)]);
                    playSound('wrong');
                }
            }, 500);

            return () => clearInterval(botInterval);
        }
    }, [isActive, isFinished]);

    // Player Progress Logic
    useEffect(() => {
        if (input.length > 0) {
            const calculatedProgress = Math.min(100, Math.floor((input.length / text.length) * 100));
            setPlayerProgress(calculatedProgress);
        }
    }, [input, text]);

    // Damage Logic on Typing
    const lastInputLen = useRef(0);
    useEffect(() => {
        if (input.length > lastInputLen.current) {
            const char = input[input.length - 1];
            const correctChar = text[input.length - 1];

            if (char === correctChar) {
                // Combo logic
                setCombo(c => c + 1);
                if (combo > 0 && combo % 10 === 0) {
                    playSound('correct');
                    // Power Boost!
                    setBattleLog(prev => [`COMBO x${combo}! Speed Boost!`, ...prev.slice(0, 4)]);
                }

                // Damage
                if (combo % 5 === 0) {
                    setEnemyHealth(h => Math.max(0, h - 2));
                }
            } else {
                setCombo(0);
                playSound('wrong');
            }
        }
        lastInputLen.current = input.length;
    }, [input, text, combo]);

    // Win/Loss & Submission
    useEffect(() => {
        if (playerHealth <= 0 || enemyProgress >= 100) {
            // Defeat logic
            if (!isFinished) playSound('lose');
        } else if (enemyHealth <= 0 || playerProgress >= 100) {
            // Victory
            if (!isFinished) {
                playSound('win');
                // Submit Score
                submitScore({
                    userId: "guest", // Replace with actual Auth user ID later
                    gameId: "type-battle",
                    wpm: stats.wpm,
                    accuracy: stats.accuracy,
                    text: text,
                    keystrokeLog: keystrokeLogs
                }).then(result => {
                    if (!result.success) {
                        alert(`Score Rejected! ${result.message}`);
                    } else {
                        console.log("Score Submitted!");
                    }
                });
            }
        }
    }, [playerHealth, enemyHealth, playerProgress, enemyProgress, isFinished]);

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>

            {/* Visual Race Track */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
                <h3 className="text-muted" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Flag size={18} /> Race Track
                </h3>

                {/* Player Lane */}
                <div style={{ position: 'relative', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginBottom: '1rem' }}>
                    <div style={{
                        position: 'absolute',
                        left: `${playerProgress}%`,
                        top: '-10px',
                        transition: 'left 0.3s ease',
                        transform: 'translateX(-50%)'
                    }}>
                        <div style={{ background: '#00f3ff', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 0 15px #00f3ff' }}>
                            <Swords size={24} color="#000" />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.2rem', color: '#00f3ff' }}>You</div>
                    </div>
                    <div style={{ width: `${playerProgress}%`, height: '100%', background: 'linear-gradient(90deg, rgba(0,243,255,0.1), rgba(0,243,255,0.5))', borderRadius: '20px' }} />
                </div>

                {/* Enemy Lane */}
                <div style={{ position: 'relative', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                    <div style={{
                        position: 'absolute',
                        left: `${enemyProgress}%`,
                        top: '-10px',
                        transition: 'left 0.3s ease',
                        transform: 'translateX(-50%)'
                    }}>
                        <div style={{ background: '#ff0055', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 0 15px #ff0055' }}>
                            <Skull size={24} color="#fff" />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.2rem', color: '#ff0055' }}>Boss</div>
                    </div>
                    <div style={{ width: `${enemyProgress}%`, height: '100%', background: 'linear-gradient(90deg, rgba(255,0,85,0.1), rgba(255,0,85,0.5))', borderRadius: '20px' }} />
                </div>
            </div>

            {/* Stats & HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #00f3ff', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Health</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{playerHealth}%</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #00ff00', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>WPM</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.wpm}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #00ff00', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Acc</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.accuracy}%</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #ffd700', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Combo</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700' }}>x{combo}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #ff0055', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Boss HP</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{enemyHealth}%</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                <Button
                    variant={isRandomMode ? "primary" : "outline"}
                    onClick={() => {
                        setIsRandomMode(!isRandomMode);
                        handleReset();
                    }}
                >
                    <Zap size={18} style={{ marginRight: '8px' }} />
                    {isRandomMode ? "Random Mode: ON" : "Random Mode: OFF"}
                </Button>
            </div>

            {/* Battle Log */}
            <div style={{ textAlign: 'center', marginBottom: '1rem', height: '60px', overflow: 'hidden' }}>
                {battleLog.map((log, i) => (
                    <div key={i} style={{ opacity: 1 - (i * 0.2), marginBottom: '0.2rem', color: log.includes('Enemy') ? '#ff0055' : '#00f3ff' }}>{log}</div>
                ))}
            </div>

            {/* Typing Area */}
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <TypingArea
                    text={isRandomMode ? generateRandomText(30) : text} // Need to sync this with useTypingTest hook ideally
                    input={input}
                    stats={{ wpm: stats.wpm, accuracy: stats.accuracy, timeLeft }}
                    isActive={isActive || (playerHealth > 0 && enemyHealth > 0 && !isFinished)}
                    isFinished={isFinished || playerHealth <= 0 || enemyHealth <= 0 || playerProgress >= 100 || enemyProgress >= 100}
                    onInput={handleInput}
                    onReset={handleReset}
                />
            </div>

            {(playerHealth <= 0 || enemyHealth <= 0 || playerProgress >= 100 || enemyProgress >= 100) && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: (enemyHealth <= 0 || playerProgress >= 100) ? '#00f3ff' : '#ff0055' }}>
                        {(enemyHealth <= 0 || playerProgress >= 100) ? 'VICTORY!' : 'DEFEAT'}
                    </h1>
                    <Button variant="outline" onClick={() => router.push('/games')}>Exit Arena</Button>
                </div>
            )}
        </div>
    );
}
