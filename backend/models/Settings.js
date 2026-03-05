const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

// Default settings (seeded on first run):
// { key: 'commissionRate', value: 10 }        -- % komissiya
// { key: 'appName', value: 'Ustabor' }
// { key: 'logoUrl', value: '' }
// { key: 'maintenanceMode', value: false }

module.exports = mongoose.model('Settings', SettingsSchema);
