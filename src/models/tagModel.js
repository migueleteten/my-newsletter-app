const mongoose = require('mongoose');

// Definir el esquema de etiquetas
const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    count: { type: Number, default: 0 }  // Conteo de artículos asociados a esta etiqueta
});

module.exports = mongoose.model('Tag', tagSchema);
