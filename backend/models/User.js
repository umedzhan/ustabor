const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String }, // Can be set after sharing contact
    profilePicture: { type: String }, // User's personal photo
    role: { type: String, enum: ['none', 'client', 'vendor', 'admin'], default: 'none' },
    onboarded: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
