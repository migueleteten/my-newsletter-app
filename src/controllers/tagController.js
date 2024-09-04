const Tag = require('../models/tagModel');

// Crear o actualizar una etiqueta
exports.createOrUpdateTag = async (req, res) => {
    try {
        const { name } = req.body;
        let tag = await Tag.findOne({ name });

        if (tag) {
            tag.count += 1;  // Incrementar el conteo si ya existe
        } else {
            tag = new Tag({ name });
        }

        await tag.save();
        res.status(200).json({ message: 'Etiqueta creada/actualizada correctamente.', tag });
    } catch (error) {
        console.error('Error al crear/actualizar la etiqueta:', error);
        res.status(500).json({ error: 'Error al crear/actualizar la etiqueta.' });
    }
};

// Listar todas las etiquetas
exports.listTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        console.error('Error al listar las etiquetas:', error);
        res.status(500).json({ error: 'Error al listar las etiquetas.' });
    }
};

// Obtener artículos por etiqueta
exports.getArticlesByTag = async (req, res) => {
    try {
        const { tagName } = req.params;
        const articles = await Article.find({ 'tags.name': tagName });
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error al obtener los artículos por etiqueta:', error);
        res.status(500).json({ error: 'Error al obtener los artículos por etiqueta.' });
    }
};
