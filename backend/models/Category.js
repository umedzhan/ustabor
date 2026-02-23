const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true, // Use a string to map to an icon library or URL
  },
});

module.exports = mongoose.model('Category', CategorySchema);
