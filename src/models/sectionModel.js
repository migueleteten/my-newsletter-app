const mongoose = require('mongoose');

const subsectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], // Referencia a los artículos de esta sección
    createdAt: { type: Date, default: Date.now }
});

const sectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    color: { type: String, required: true },
    subsections: [subsectionSchema],
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], // Referencia a los artículos de esta sección
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Section', sectionSchema);