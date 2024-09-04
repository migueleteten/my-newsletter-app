const Section = require('../models/sectionModel');  // Asegúrate de importar el modelo Section
const Article = require('../models/articleModel');  // Importar el modelo Article

// Crear un nuevo artículo
exports.createArticle = async (req, res) => {
    try {
        const { title, contentBlocks, tags, sectionId, subsectionId } = req.body;

        // Validar que se envíen los datos requeridos
        if (!title || !sectionId) {
            return res.status(400).json({ error: 'El título y la sección son obligatorios.' });
        }

        // Validar los bloques de contenido
        if (!contentBlocks || contentBlocks.length === 0) {
            return res.status(400).json({ error: 'El artículo debe contener al menos un bloque de contenido.' });
        }

        // Crear el artículo
        const article = new Article({
            title,
            contentBlocks,
            tags,
            sectionId,
            subsectionId
        });

        // Guardar el artículo en la base de datos
        await article.save();

        // Actualizar la sección o subsección correspondiente
        if (subsectionId) {
            // Si el artículo pertenece a una subsección
            await Section.updateOne(
                { 'subsections._id': subsectionId },
                { $push: { 'subsections.$.articles': article._id } }
            );
        } else {
            // Si el artículo pertenece a la sección directamente
            await Section.updateOne(
                { _id: sectionId },
                { $push: { articles: article._id } }
            );
        }

        res.status(201).json({ message: 'Artículo creado correctamente.', article });
    } catch (error) {
        console.error('Error al crear el artículo:', error);
        res.status(500).json({ error: 'Error al crear el artículo.' });
    }
};

// Listar todos los artículos por sección
exports.listArticlesBySection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const articles = await Article.find({ sectionId }).sort({ createdAt: -1 });  // Listar por fecha de creación descendente
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error al listar los artículos:', error);
        res.status(500).json({ error: 'Error al listar los artículos.' });
    }
};

// Obtener los detalles de un artículo específico
exports.getArticleById = async (req, res) => {
    try {
        const { articleId } = req.params;
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Artículo no encontrado.' });
        }
        res.status(200).json(article);
    } catch (error) {
        console.error('Error al obtener el artículo:', error);
        res.status(500).json({ error: 'Error al obtener el artículo.' });
    }
};

// Editar un artículo existente
exports.updateArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { title, contentBlocks, tags } = req.body;

        const article = await Article.findByIdAndUpdate(articleId, { title, contentBlocks, tags }, { new: true });
        if (!article) {
            return res.status(404).json({ error: 'Artículo no encontrado.' });
        }

        res.status(200).json({ message: 'Artículo actualizado correctamente.', article });
    } catch (error) {
        console.error('Error al actualizar el artículo:', error);
        res.status(500).json({ error: 'Error al actualizar el artículo.' });
    }
};

// Eliminar un artículo
exports.deleteArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const article = await Article.findByIdAndDelete(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Artículo no encontrado.' });
        }

        res.status(200).json({ message: 'Artículo eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar el artículo:', error);
        res.status(500).json({ error: 'Error al eliminar el artículo.' });
    }
};

// Destacar o eliminar el destacamento de un artículo
exports.highlightArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Artículo no encontrado.' });
        }

        article.isHighlighted = !article.isHighlighted;
        await article.save();

        res.status(200).json({ message: 'Estado de destacado actualizado.', isHighlighted: article.isHighlighted });
    } catch (error) {
        console.error('Error al destacar el artículo:', error);
        res.status(500).json({ error: 'Error al destacar el artículo.' });
    }
};

// Reordenar artículos dentro de una sección
exports.reorderArticles = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { articleOrder } = req.body;  // Un array con los IDs de los artículos en el nuevo orden

        // Actualizar la posición de cada artículo basado en el nuevo orden
        for (let i = 0; i < articleOrder.length; i++) {
            await Article.findByIdAndUpdate(articleOrder[i], { position: i });
        }

        res.status(200).json({ message: 'Artículos reordenados correctamente.' });
    } catch (error) {
        console.error('Error al reordenar los artículos:', error);
        res.status(500).json({ error: 'Error al reordenar los artículos.' });
    }
};

// Buscar artículos por palabra clave o etiqueta
exports.searchArticles = async (req, res) => {
    try {
        const { query } = req.query;  // La palabra clave que se busca
        const articles = await Article.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },  // Buscar en el título (insensible a mayúsculas)
                { 'tags.name': { $regex: query, $options: 'i' } }  // Buscar en las etiquetas
            ]
        });

        res.status(200).json(articles);
    } catch (error) {
        console.error('Error al buscar artículos:', error);
        res.status(500).json({ error: 'Error al buscar artículos.' });
    }
};
