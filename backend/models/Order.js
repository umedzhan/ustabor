const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    serviceDetails: {
        name: String,
        price: Number
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'evaluated'],
        default: 'created'
    },
    price: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card'], required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }, // [longitude, latitude]
        address: String
    },
    appointmentTime: { type: Date, required: true },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
    },
    cancelReason: { type: String }
}, { timestamps: true });

OrderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', OrderSchema);
