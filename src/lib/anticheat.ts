
// Basic Types
interface KeyLog {
    char: string;
    timestamp: number;
}

export class AntiCheatSystem {
    private keyLogs: KeyLog[] = [];
    private startTime: number = 0;
    private pasteCount: number = 0;
    private suspicionScore: number = 0;

    constructor() {
        this.reset();
    }

    reset() {
        this.keyLogs = [];
        this.startTime = Date.now();
        this.pasteCount = 0;
        this.suspicionScore = 0;
    }

    logKey(char: string) {
        this.keyLogs.push({ char, timestamp: Date.now() });
    }

    logPaste() {
        this.pasteCount++;
        this.suspicionScore += 40; // High penalty for pasting
    }

    // Call this before submitting score
    validate(textLength: number, totalTimeMs: number): { isValid: boolean; suspicionScore: number; reason?: string } {
        // 1. Check for realistic WPM
        // (Chars / 5) / (Time / 60000)
        const wpm = (textLength / 5) / (totalTimeMs / 60000);

        if (wpm > 250) {
            this.suspicionScore += 100; // Immediate flag for super-human speed
            return { isValid: false, suspicionScore: this.suspicionScore, reason: 'Unrealistic WPM' };
        }

        // 2. Check Key Intervals (Variance)
        if (this.keyLogs.length > 10) {
            const intervals = [];
            for (let i = 1; i < this.keyLogs.length; i++) {
                intervals.push(this.keyLogs[i].timestamp - this.keyLogs[i - 1].timestamp);
            }

            // Calculate variance
            const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;

            if (variance < 5) { // Extremely low variance = likely a bot/macro
                this.suspicionScore += 50;
                return { isValid: false, suspicionScore: this.suspicionScore, reason: 'Bot-like typing consistency' };
            }
        }

        // 3. Paste Checks
        if (this.pasteCount > 0) {
            return { isValid: false, suspicionScore: this.suspicionScore, reason: 'Paste detected' };
        }

        return { isValid: this.suspicionScore < 50, suspicionScore: this.suspicionScore };
    }
}

export const antiCheat = new AntiCheatSystem();
