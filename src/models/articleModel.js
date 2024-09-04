const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    content: {
        type: String,  // Aquí se almacena el contenido: texto o imagen en base64
        required: true
    }
});

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tags: [String],
    contentBlocks: [ContentBlockSchema], // Los bloques de contenido
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    subsectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subsection', required: false }
});

module.exports = mongoose.model('Article', ArticleSchema);
