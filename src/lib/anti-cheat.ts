
export interface KeystrokeLog {
    char: string;
    timestamp: number;
}

export interface AntiCheatResult {
    isValid: boolean;
    suspicionScore: number;
    flags: string[];
}

export const SUSPICION_THRESHOLDS = {
    WPM_SPIKE: 220,
    CONSISTENCY_VARIANCE_LOW: 5, // ms squared, suspiciously consistent
    PASTE_PENALTY: 40,
    SPIKE_PENALTY: 30,
    LOW_VARIANCE_PENALTY: 50,
};

export function analyzeKeystrokes(logs: KeystrokeLog[], expectedText: string): AntiCheatResult {
    let suspicionScore = 0;
    const flags: string[] = [];

    if (!logs || logs.length < 5) {
        return { isValid: true, suspicionScore: 0, flags: [] }; // Too short to judge
    }

    // 1. Calculate Intervals and Variance
    const intervals: number[] = [];
    for (let i = 1; i < logs.length; i++) {
        intervals.push(logs[i].timestamp - logs[i - 1].timestamp);
    }

    // Filter out pauses (pausing to think is normal, only analyze typing bursts)
    const typingIntervals = intervals.filter(i => i < 2000);

    if (typingIntervals.length > 5) {
        const mean = typingIntervals.reduce((a, b) => a + b, 0) / typingIntervals.length;
        const variance = typingIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / typingIntervals.length;

        // 3. Keystroke Timing Analysis (Bot check)
        if (variance < SUSPICION_THRESHOLDS.CONSISTENCY_VARIANCE_LOW) {
            suspicionScore += SUSPICION_THRESHOLDS.LOW_VARIANCE_PENALTY;
            flags.push("Unnatural Consistency (Bot-like)");
        }
    }

    // 2. Unrealistic WPM Spike Detection
    // Simple check: minimal time to type full text
    const totalTime = logs[logs.length - 1].timestamp - logs[0].timestamp;
    const chars = logs.length;
    const wpm = (chars / 5) / (totalTime / 60000);

    if (wpm > SUSPICION_THRESHOLDS.WPM_SPIKE) {
        suspicionScore += SUSPICION_THRESHOLDS.SPIKE_PENALTY;
        flags.push(`Unrealistic WPM: ${Math.round(wpm)}`);
    }

    // 4. Paste detection (Client usually handles prevention, but server double checks burst)
    // If many chars appear with < 10ms interval
    const instantBursts = intervals.filter(i => i < 10).length;
    if (instantBursts > 5) {
        suspicionScore += SUSPICION_THRESHOLDS.PASTE_PENALTY;
        flags.push("Instant Burst (Possible Paste)");
    }

    return {
        isValid: suspicionScore < 100,
        suspicionScore,
        flags
    };
}
