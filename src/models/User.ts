import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        unique: true,
    },
    username: {
        type: String,
        required: [true, 'Please provide a username.'],
        maxlength: [20, 'Username cannot be more than 20 characters'],
    },
    displayName: String,
    bio: String,
    country: String,
    keyboard: String,
    image: String,
    provider: {
        type: String,
        enum: ['google', 'email'],
        default: 'email',
    },
    stats: {
        averageWpm: { type: Number, default: 0 },
        bestWpm: { type: Number, default: 0 },
        averageAccuracy: { type: Number, default: 0 },
        testsTaken: { type: Number, default: 0 },
        totalTimeTyped: { type: Number, default: 0 }, // in seconds
    },
    history: [{
        wpm: Number,
        accuracy: Number,
        date: { type: Date, default: Date.now },
    }],
}, {
    timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
