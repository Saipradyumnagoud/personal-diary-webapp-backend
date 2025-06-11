const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');

// GET: All entry dates for a user (protected)
router.get('/dates/all', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.user.id }).select('date -_id');
        const dates = entries.map(entry => entry.date);
        res.json(dates);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch entry dates' });
    }
});

// POST: Create new entry (protected)
router.post('/', auth, upload.array('images'), async (req, res) => {
    try {
        const { title, text, tags, mood, date } = req.body;
        const imagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];

        const newEntry = new Entry({
            userId: req.user.id,
            title,
            text,
            tags: tags?.split(',').map(t => t.trim()) || [],
            mood,
            date,
            images: imagePaths
        });

        await newEntry.save();
        res.status(201).json({ newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating entry' });
    }
});

// GET: Entries for a specific date (protected)
router.get('/:date', auth, async (req, res) => {
    try {
        const entries = await Entry.find({
            userId: req.user.id,
            date: req.params.date
        });
        res.json({ entries });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch entries' });
    }
});

// DELETE: Remove an entry (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry || entry.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized or entry not found' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete entry' });
    }
});

module.exports = router;