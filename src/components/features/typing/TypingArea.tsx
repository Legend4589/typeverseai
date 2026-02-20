"use client";

import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import styles from './TypingArea.module.css';

interface TypingStats {
    wpm: number;
    accuracy: number;
    timeLeft: number;
}

interface TypingAreaProps {
    text: string;
    input: string;
    stats: TypingStats;
    isActive: boolean;
    isFinished: boolean;
    onInput: (val: string) => void;
    onReset: () => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({
    text,
    input,
    stats,
    isActive,
    isFinished,
    onInput,
    onReset
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input automatically
    useEffect(() => {
        if (!isFinished) {
            inputRef.current?.focus();
        }
    }, [isFinished, isActive]);

    // Handle click to refocus
    const handleFocus = () => {
        inputRef.current?.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInput(e.target.value);
    };

    // Render text with highlighting
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = styles.char;
            const inputChar = input[index];

            if (index < input.length) {
                className = clsx(styles.char, inputChar === char ? styles.correct : styles.incorrect);
            } else if (index === input.length) {
                className = clsx(styles.char, styles.current); // Cursor position
            }

            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{stats.wpm}</span>
                    <span className={styles.statLabel}>WPM</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{stats.accuracy}%</span>
                    <span className={styles.statLabel}>Accuracy</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{stats.timeLeft}s</span>
                    <span className={styles.statLabel}>Time</span>
                </div>
            </div>

            <div className={styles.textDisplay} onClick={handleFocus}>
                {renderText()}

                {/* Invisible input overlay */}
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.inputHidden}
                    value={input}
                    onChange={handleChange}
                    disabled={isFinished}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    onPaste={(e) => { e.preventDefault(); }}
                    onContextMenu={(e) => { e.preventDefault(); }}
                />
            </div>

            {isFinished && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '2rem', textAlign: 'center' }}
                >
                    <h2 style={{ marginBottom: '1rem' }}>Test Complete!</h2>
                    <Button onClick={onReset} size="lg" variant="primary">Try Again</Button>
                </motion.div>
            )}
        </div>
    );
};

export default TypingArea;
