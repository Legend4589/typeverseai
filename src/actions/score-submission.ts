'use server'

import { analyzeKeystrokes, KeystrokeLog } from '@/lib/anti-cheat';

export async function submitScore(data: {
    userId: string;
    gameId: string;
    wpm: number;
    accuracy: number;
    text: string;
    keystrokeLog: KeystrokeLog[];
}) {
    console.log(`[Score Submission] User: ${data.userId}, Game: ${data.gameId}, WPM: ${data.wpm}`);

    // 1. Anti-Cheat Validation
    const analysis = analyzeKeystrokes(data.keystrokeLog, data.text);

    if (!analysis.isValid) {
        console.warn(`[Anti-Cheat] Rejected score for User ${data.userId}. Flags: ${analysis.flags.join(', ')}`);
        return {
            success: false,
            message: "Score rejected by anti-cheat system.",
            flags: analysis.flags,
            suspicionScore: analysis.suspicionScore
        };
    }

    // 2. Database Saving (Mock for now, normally would use Prisma/connect to DB)
    // await db.scores.create({ ... });

    console.log(`[Score Submission] Score Accepted! Suspicion: ${analysis.suspicionScore}`);

    return {
        success: true,
        message: "Score submitted successfully!",
        suspicionScore: analysis.suspicionScore
    };
}
