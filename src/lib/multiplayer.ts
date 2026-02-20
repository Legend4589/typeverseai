"use client";

import { db } from './firebase';
import { ref, set, get, update, onValue, push, child, Unsubscribe } from 'firebase/database';

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    progress: number; // 0-100
    wpm: number;
    status: 'ready' | 'playing' | 'finished';
}

export interface GameRoom {
    id: string;
    hostId: string;
    status: 'waiting' | 'starting' | 'playing' | 'finished';
    gameMode: string;
    players: Record<string, Player>;
    startTime?: number;
}

export const createRoom = async (hostId: string, hostName: string, gameMode: string): Promise<string> => {
    if (!db) throw new Error("Firebase DB not initialized");

    const roomsRef = ref(db, 'rooms');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const initialPlayer: Player = {
        id: hostId,
        name: hostName,
        isHost: true,
        progress: 0,
        wpm: 0,
        status: 'ready'
    };

    const roomData: GameRoom = {
        id: roomId,
        hostId,
        status: 'waiting',
        gameMode,
        players: {
            [hostId]: initialPlayer
        }
    };

    await set(newRoomRef, roomData);
    return roomId;
};

export const joinRoom = async (roomId: string, userId: string, userName: string): Promise<boolean> => {
    if (!db) throw new Error("Firebase DB not initialized");

    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) return false;

    const room = snapshot.val() as GameRoom;
    if (room.status !== 'waiting') return false; // Cannot join if game started

    const newPlayer: Player = {
        id: userId,
        name: userName,
        isHost: false,
        progress: 0,
        wpm: 0,
        status: 'ready'
    };

    await update(child(roomRef, `players/${userId}`), newPlayer);
    return true;
};

export const subscribeToRoom = (roomId: string, callback: (room: GameRoom | null) => void): Unsubscribe => {
    if (!db) {
        console.error("Firebase DB not initialized");
        return () => { };
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        callback(data ? (data as GameRoom) : null);
    });
};

export const updateProgress = async (roomId: string, userId: string, progress: number, wpm: number) => {
    if (!db) return;
    const playerRef = ref(db, `rooms/${roomId}/players/${userId}`);
    await update(playerRef, { progress, wpm });
};

export const setGameStatus = async (roomId: string, status: GameRoom['status']) => {
    if (!db) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    await update(roomRef, { status });
};
