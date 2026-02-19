import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    wpm: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true, // 15, 30, 60, 120
    },
    mode: {
        type: String, // 'time', 'words', 'quote'
        default: 'time',
    },
    language: {
        type: String,
        default: 'english',
    },
    platform: {
        type: String, // 'web', 'mobile'
    },
}, {
    timestamps: true,
});

// Index for fast leaderboard queries
ScoreSchema.index({ wpm: -1, accuracy: -1 });

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);
