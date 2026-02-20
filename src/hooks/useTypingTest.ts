"use client";

import { useMemo, useState, useEffect, useRef } from 'react';

interface KeystrokeLog {
    char: string;
    timestamp: number;
}

// Common words for testing "AI" generation (mock for now)
const DEFAULT_WORDS = "the quick brown fox jumps over the lazy dog typists are awesome developers code fast react nextjs typescript ai machine learning keyboard speed user experience interface design performance optimization database connection security cloud computing algorithm structure function loop variable constant object array string number boolean null undefined symbol promise async await try catch error handling debugging testing deployment serverless function api graphql rest json yaml xml html css sass less stylus tailwind bootstrap foundation materialize chakra ant design semantic ui bulma pure uikit milligram spectre picnic skeleton tacony robertson phillips slot torx allen hex spline triple square bristol double hex pentalobe polydrive one-way clutch security torx security hex tri-wing torq-set spanner grub screw set screw shoulder screw thumb machine wood sheet metal concrete masonry drywall lag bolt carriage elevator plow track hanger eye stud anchor toggle molly plastic rawlplug fibre lead resin chemical epoxy silicone acrylic polyurethane latex rubber nitrile neoprene viton epdm butyl hypalon kalrez chemraz aflas simriz perlast isolast markez zalak spectrasil".split(' ');

interface TypingStats {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    missedChars: number;
    extraChars: number;
    elapsedTime: number; // in seconds
}

export function useTypingTest(duration: number = 60) {
    const [text, setText] = useState("");
    const [input, setInput] = useState("");
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [stats, setStats] = useState<TypingStats>({
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
        correctChars: 0,
        incorrectChars: 0,
        missedChars: 0,
        extraChars: 0,
        elapsedTime: 0,
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Generate random text (Simulating AI generation)
    const generateText = (count: number = 50) => {
        let newText = [];
        for (let i = 0; i < count; i++) {
            newText.push(DEFAULT_WORDS[Math.floor(Math.random() * DEFAULT_WORDS.length)]);
        }
        setText(newText.join(' '));
    };

    useEffect(() => {
        generateText();
    }, []);

    const calculateStats = (currentInput: string) => {
        if (!startTimeRef.current) return;

        // Calculate raw WPM
        // Each word is considered 5 characters
        const now = Date.now();
        const durationInMinutes = (now - startTimeRef.current) / 1000 / 60;

        if (durationInMinutes <= 0) return;

        let correct = 0;
        let incorrect = 0;

        // Compare input with text
        const inputChars = currentInput.split('');
        const textChars = text.split('');

        inputChars.forEach((char, index) => {
            if (char === textChars[index]) {
                correct++;
            } else {
                incorrect++;
            }
        });

        const rawWpm = Math.round((inputChars.length / 5) / durationInMinutes);
        const wpm = Math.round(((correct / 5) - incorrect) / durationInMinutes); // Adjusted WPM (standard formula often penalizes errors)
        const accuracy = inputChars.length > 0 ? Math.round((correct / inputChars.length) * 100) : 100;

        setStats(prev => ({
            ...prev,
            wpm: Math.max(0, wpm),
            rawWpm,
            accuracy,
            correctChars: correct,
            incorrectChars: incorrect,
            elapsedTime: (now - startTimeRef.current!) / 1000
        }));
    };

    const startTest = () => {
        setIsActive(true);
        setIsFinished(false);
        setInput("");
        setTimeLeft(duration);
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endTest = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setIsFinished(true);
        // Here we would dispatch stats to API
    };

    const [keystrokeLogs, setKeystrokeLogs] = useState<{ char: string, timestamp: number }[]>([]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const val = typeof e === 'string' ? e : e.target.value;
        const now = Date.now();

        if (!isActive && !isFinished && val.length > 0) {
            startTest();
        }

        if (isFinished) return;

        // Log Keystroke
        if (val.length > input.length) {
            const char = val.slice(-1);
            setKeystrokeLogs(prev => [...prev, { char, timestamp: now }]);
        }

        setInput(val);
        // ... (rest of function)
        calculateStats(val); // Re-added verify logic

        if (val.length >= text.length) {
            endTest();
        }
    };

    // ... calculateStats ...

    const resetTest = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setIsFinished(false);
        setInput("");
        setTimeLeft(duration);
        setKeystrokeLogs([]); // Reset logs
        generateText();
        setStats({
            wpm: 0,
            rawWpm: 0,
            accuracy: 100,
            correctChars: 0,
            incorrectChars: 0,
            missedChars: 0,
            extraChars: 0,
            elapsedTime: 0
        });
    };

    return {
        text,
        input,
        timeLeft,
        isActive,
        isFinished,
        stats,
        keystrokeLogs,
        handleInput,
        resetTest,
        setText
    };
}

