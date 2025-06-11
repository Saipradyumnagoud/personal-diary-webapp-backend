const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    title: String,
    text: String,
    tags: [String],
    mood: String,
    images: [String],
}, { timestamps: true });

module.exports = mongoose.model('Entry', entrySchema);