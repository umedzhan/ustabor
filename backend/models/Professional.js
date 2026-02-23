const mongoose = require('mongoose');

const ProfessionalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    rating: { type: Number, required: true },
    reviewCount: { type: Number, required: true },
    hourlyRate: { type: Number, required: true }, // So'm
    experienceYears: { type: Number, required: true },
    completedJobs: { type: Number, required: true },
    location: { type: String, required: true },
    aboutText: { type: String, required: true },
    services: [{ type: String }],
    imageUrl: { type: String, required: true }, // Placeholder image URL
});

module.exports = mongoose.model('Professional', ProfessionalSchema);
