const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Category = require('./models/Category');
const Professional = require('./models/Professional');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ustabor').then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// API Routes

// 1. Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving categories' });
    }
});

// 2. Get all professionals (optionally filter by category and search)
app.get('/api/professionals', async (req, res) => {
    try {
        const { categoryId, search } = req.query;
        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }

        let professionals = await Professional.find(query).populate('category', 'name icon');

        if (search) {
            const lowerSearch = search.toLowerCase();
            professionals = professionals.filter(pro =>
                pro.name.toLowerCase().includes(lowerSearch)
            );
        }

        res.json(professionals);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving professionals' });
    }
});

// 3. Get a single professional by ID
app.get('/api/professionals/:id', async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id).populate('category', 'name icon');
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }
        res.json(professional);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving professional details' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ token: 'ustabor-secure-token-123' });
    } else {
        res.status(401).json({ error: 'Noto\'g\'ri login yoki parol' });
    }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer ustabor-secure-token-123') {
        next();
    } else {
        res.status(403).json({ error: 'Ruxsat etilmagan' });
    }
};

// 4. Create a new professional
app.post('/api/professionals', verifyAdmin, async (req, res) => {
    try {
        const newProfessional = new Professional(req.body);
        const savedProfessional = await newProfessional.save();
        res.status(201).json(savedProfessional);
    } catch (err) {
        res.status(500).json({ error: 'Server error creating professional', details: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
