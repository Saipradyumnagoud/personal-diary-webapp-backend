const DiaryEntry = require('../models/DiaryEntry');

exports.createOrUpdateEntry = async (req, res) => {
    const { date, text } = req.body;
    const userId = req.user.userId;
    const imagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
        return res.status(400).json({ message: 'Cannot write entries for future dates' });
    }

    try {
        let entry = await DiaryEntry.findOne({ user: userId, date });
        if (entry) {
            entry.text = text;
            entry.images.push(...imagePaths);
        } else {
            entry = new DiaryEntry({ user: userId, date, text, images: imagePaths });
        }

        await entry.save();
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Failed to save diary entry' });
    }
};

exports.getEntry = async (req, res) => {
    const { date } = req.params;
    const userId = req.user.userId;

    try {
        const entry = await DiaryEntry.findOne({ user: userId, date });
        if (!entry) return res.status(404).json({ message: 'No entry found' });
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching entry' });
    }
};

exports.getEntryDates = async (req, res) => {
    const userId = req.user.userId;

    try {
        const entries = await DiaryEntry.find({ user: userId }).select('date -_id');
        const dates = entries.map(entry => entry.date);
        res.status(200).json(dates);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch entry dates' });
    }
};
