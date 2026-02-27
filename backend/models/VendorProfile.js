const mongoose = require('mongoose');

const VendorProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    experienceYears: { type: Number, default: 0 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
        address: { type: String }
    },
    services: [{
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    isOnline: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    documents: [{ type: String }], // URLs to documents
    aboutText: { type: String },
    portfolio: [{ type: String }] // URLs to portfolio images
}, { timestamps: true });

VendorProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('VendorProfile', VendorProfileSchema);
