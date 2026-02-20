"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type SoundType = 'click' | 'correct' | 'wrong' | 'win' | 'lose' | 'bgm_racing' | 'bgm_rain' | 'bgm_horror' | 'bgm_arcade';

interface SoundContextType {
    playSound: (type: SoundType) => void;
    playBGM: (type: SoundType) => void;
    stopBGM: () => void;
    toggleMute: () => void;
    isMuted: boolean;
    volume: number;
    setVolume: (vol: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const bgmRef = useRef<HTMLAudioElement | null>(null);

    // Sound assets map (using placeholders for now)
    // In a real app, these would be paths to mp3/wav files in public/sounds/
    const sounds: Record<SoundType, string> = {
        click: '/sounds/click.mp3',
        correct: '/sounds/correct.mp3',
        wrong: '/sounds/wrong.mp3',
        win: '/sounds/win.mp3',
        lose: '/sounds/lose.mp3',
        bgm_racing: '/sounds/bgm_racing.mp3',
        bgm_rain: '/sounds/bgm_rain.mp3',
        bgm_horror: '/sounds/bgm_horror.mp3',
        bgm_arcade: '/sounds/bgm_arcade.mp3',
    };

    const playSound = (type: SoundType) => {
        if (isMuted) return;
        // Simple fire-and-forget for SFX
        // const audio = new Audio(sounds[type]);
        // audio.volume = volume;
        // audio.play().catch(e => console.log("Audio play error", e));
        console.log(`[SoundManager] Playing SFX: ${type}`);
    };

    const playBGM = (type: SoundType) => {
        if (isMuted) return;
        if (bgmRef.current) {
            bgmRef.current.pause();
        }
        // bgmRef.current = new Audio(sounds[type]);
        // bgmRef.current.loop = true;
        // bgmRef.current.volume = volume * 0.8; // Slightly lower for BGM
        // bgmRef.current.play().catch(e => console.log("BGM play error", e));
        console.log(`[SoundManager] Playing BGM: ${type}`);
    };

    const stopBGM = () => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current = null;
        }
        console.log(`[SoundManager] Stopped BGM`);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        if (!isMuted) {
            stopBGM();
        }
    };

    return (
        <SoundContext.Provider value={{ playSound, playBGM, stopBGM, toggleMute, isMuted, volume, setVolume }}>
            {children}
        </SoundContext.Provider>
    );
};
