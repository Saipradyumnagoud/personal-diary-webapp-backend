const Entry = require('../models/Entry');

exports.getEntriesByDate = async (req, res) => {
    try {
        const entries = await Entry.find({
            userId: req.user.id,
            date: req.params.date,
        });
        res.json({ entries });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching entries' });
    }
};

exports.createEntry = async (req, res) => {
    try {
        const imagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];
        const newEntry = new Entry({
            userId: req.user.id,
            date: req.body.date,
            title: req.body.title,
            text: req.body.text,
            tags: req.body.tags?.split(',').map(tag => tag.trim()) || [],
            mood: req.body.mood,
            images: imagePaths,
        });

        await newEntry.save();
        res.status(201).json({ newEntry });
    } catch (err) {
        res.status(500).json({ message: 'Error saving entry' });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry || entry.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized or entry not found' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting entry' });
    }
};
