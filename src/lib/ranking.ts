export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

export const getRank = (mmr: number): Rank => {
    if (mmr < 1000) return 'Bronze';
    if (mmr < 1500) return 'Silver';
    if (mmr < 2000) return 'Gold';
    if (mmr < 2500) return 'Platinum';
    if (mmr < 3000) return 'Diamond';
    if (mmr < 3500) return 'Master';
    return 'Grandmaster';
};

export const calculateMmrChange = (currentMmr: number, wpm: number, accuracy: number, place: number = 1): number => {
    // Basic ELO-like formula simplified for typing
    // Base gain based on WPM performance
    let gain = (wpm - 30) * (accuracy / 100);

    // Bonus for winning (place 1)
    if (place === 1) gain += 20;

    // Diminishing returns for high MMR
    if (currentMmr > 2000) gain *= 0.5;

    return Math.floor(Math.max(-20, gain)); // Can lose MMR if performance is very bad
};
