const mongoose = require('mongoose');

const subsectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const sectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    color: { type: String, required: true },
    subsections: [subsectionSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Section', sectionSchema);