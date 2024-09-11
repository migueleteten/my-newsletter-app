const Section = require('../models/sectionModel');  // Asegúrate de importar el modelo Section
const Article = require('../models/articleModel');  // Importar el modelo Article
const mongoose = require('mongoose');  // Asegúrate de importar mongoose
const Comment = require('../models/commentModel');

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

// Obtener artículos por un conjunto de IDs
exports.getArticlesByIds = async (req, res) => {
    try {
      const { articleIds } = req.body;  // Recibe un array de IDs en el cuerpo de la solicitud
      console.log('IDs de artículos recibidos:', articleIds);  // Verificar si los IDs llegan al servidor
  
      if (!articleIds || articleIds.length === 0) {
        return res.status(400).json({ message: 'Debe proporcionar al menos un ID de artículo.' });
      }
  
      // Extraer el ID correcto si viene en el formato {$oid: 'id'}
      const validIds = articleIds.map(id => {
        // Si el ID está anidado como {$oid: "id"}, extraer el valor
        return typeof id === 'object' && id.$oid ? id.$oid : id;
      }).filter(id => mongoose.Types.ObjectId.isValid(id));  // Validar solo los IDs válidos
  
      if (validIds.length === 0) {
        return res.status(400).json({ message: 'Ninguno de los IDs proporcionados es válido.' });
      }

      console.log('IDs válidos:', validIds);  // Verificación de los IDs válidos
  
      // Convertir los IDs válidos a ObjectId
      const objectIds = validIds.map(id => mongoose.Types.ObjectId(id));
  
      // Buscar los artículos por los IDs
      const articles = await Article.find({ _id: { $in: objectIds } });
  
      if (articles.length === 0) {
        return res.status(404).json({ message: 'No se encontraron artículos con los IDs proporcionados.' });
      }

      console.log('Artículos encontrados:', articles);  // Verificación de los artículos encontrados
  
      res.status(200).json(articles);
    } catch (error) {
      console.error('Error al obtener los artículos:', error);
      res.status(500).json({ message: 'Error al obtener los artículos.', error });
    }
  };

// Obtener los detalles de un artículo específico
exports.getArticleById = async (req, res) => {
    try {
        const articleId = req.params.articleId;  // No necesitas desestructurar aquí
        const article = await Article.findById(articleId);
        
        if (!article) {
            return res.status(404).json({ error: 'Artículo no encontrado.' });
        }
        
        res.status(200).json(article);  // Devuelve el artículo encontrado
    } catch (error) {
        console.error('Error al obtener el artículo:', error);
        res.status(500).json({ error: 'Error al obtener el artículo.' });
    }
};

// Actualizar un artículo existente
exports.updateArticle = async (req, res) => {
    try {
        const { title, contentBlocks, tags } = req.body;
        const { articleId } = req.params; // Esto debería funcionar

        // Validar que los datos requeridos están presentes
        if (!title || !contentBlocks) {
            return res.status(400).json({ error: 'El título y el contenido son obligatorios.' });
        }

        // Actualizar el artículo
        const updatedArticle = await Article.findByIdAndUpdate(articleId, { title, contentBlocks, tags }, { new: true });

        if (!updatedArticle) {
            return res.status(404).json({ error: 'Artículo no encontrado.' });
        }

        res.status(200).json({ message: 'Artículo actualizado correctamente.', article: updatedArticle });
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

        // Cambiar el estado de destacado
        article.starred = !article.starred;
        await article.save();

        res.status(200).json({ message: 'Estado de destacado actualizado.', starred: article.starred });
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

// Función para normalizar texto, eliminando tildes
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");  // Quita tildes
}

// Buscar artículos por palabra clave, sección, subsección o etiqueta
exports.searchArticles = async (req, res) => {
    try {
        const { query, sectionId, subsectionId, tag } = req.query;

        console.log('Parámetros de la solicitud (req.query):', req.query);
        console.log('Valor del parámetro tag:', tag);

        // Construir el filtro de búsqueda dinámicamente
        const searchFilter = {};

        // Filtrar por etiqueta si se proporciona y decodificarla correctamente
        if (tag) {
            const normalizedTag = normalizeString(decodeURIComponent(tag));
            searchFilter.tags = { $regex: new RegExp(normalizedTag, 'i') };  // Búsqueda insensible a tildes en las etiquetas
        }

        // Filtrar por palabra clave si se proporciona
        if (query) {
            const normalizedQuery = normalizeString(query);  // Normalizar para quitar tildes
            console.log('Query normalizado:', normalizedQuery);

            // Utilizar $text para realizar la búsqueda en los campos indexados
            searchFilter.$text = { $search: normalizedQuery };

            console.log('Filtro por query (usando $text):', JSON.stringify(searchFilter, null, 2));  // Verificar el filtro de query
        }

        // Filtro de sección y subsección si existen y son válidos
        if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
            searchFilter.sectionId = sectionId;
        }
        if (subsectionId && mongoose.Types.ObjectId.isValid(subsectionId)) {
            searchFilter.subsectionId = subsectionId;
        }

        // Verificar el filtro final que se enviará a la base de datos
        console.log('Filtro final:', JSON.stringify(searchFilter, null, 2));

        // Realizar la búsqueda con las condiciones acumuladas
        const articles = await Article.find(searchFilter);

        // Verificar cuántos artículos se han encontrado con el filtro
        console.log(`Artículos encontrados: ${articles.length}`);

        // Calcular relevancia de cada artículo
        const articlesWithRelevance = articles.map(article => {
            let relevance = 0;

            console.log('Procesando artículo:', article.title);

            // Si se buscan palabras clave, calcular relevancia
            if (query) {
                const keywords = query.split(' ').filter(Boolean);
                keywords.forEach(keyword => {
                    const regex = new RegExp(normalizeString(keyword), 'i');
                    console.log('Comparando con regex:', regex);

                    // Mayor peso en coincidencias en el título
                    if (regex.test(normalizeString(article.title))) {
                        console.log(`Coincidencia encontrada en el título: ${article.title}`);
                        relevance += 10;
                    }

                    // Peso medio en coincidencias en las etiquetas
                    if (article.tags.some(tag => regex.test(normalizeString(tag)))) {
                        console.log(`Coincidencia encontrada en las etiquetas: ${article.tags}`);
                        relevance += 5;
                    }

                    // Menor peso en coincidencias en los bloques de contenido de texto
                    article.contentBlocks.forEach(block => {
                        if (block.type === 'text' && regex.test(normalizeString(block.content))) {
                            console.log(`Coincidencia encontrada en el contenido: ${block.content}`);
                            relevance += 3;
                        }
                    });
                });
            }

            // Retornar el artículo con su relevancia
            return { ...article._doc, relevance };
        });

        // Ordenar los artículos por relevancia (de mayor a menor)
        articlesWithRelevance.sort((a, b) => b.relevance - a.relevance);

        // Retornar los artículos ordenados por relevancia
        res.status(200).json(articlesWithRelevance);
    } catch (error) {
        console.error('Error al buscar artículos:', error);
        res.status(500).json({ error: 'Error al buscar artículos.' });
    }
};

// Publicar los artículos seleccionados
exports.publishArticles = async (req, res) => {
    try {
        const { articleIds } = req.body; // Recibe un array de IDs de artículos

        if (!articleIds || articleIds.length === 0) {
            return res.status(400).json({ error: 'No se seleccionaron artículos para publicar.' });
        }

        // Actualizar el campo published de los artículos seleccionados
        await Article.updateMany(
            { _id: { $in: articleIds } },
            { $set: { published: true } }
        );

        res.status(200).json({ message: 'Artículos publicados correctamente.' });
    } catch (error) {
        console.error('Error al publicar los artículos:', error);
        res.status(500).json({ error: 'Error al publicar los artículos.' });
    }
};

// Obtener artículos pendientes de publicación
exports.getPendingArticles = async (req, res) => {
    try {
        // Buscar artículos que no estén publicados
        const pendingArticles = await Article.find({ published: false });

        if (!pendingArticles || pendingArticles.length === 0) {
            return res.status(404).json({ error: 'No hay artículos pendientes.' });
        }

        // Crear un resumen para cada artículo basándonos en el primer bloque de texto
        const articlesWithSummary = pendingArticles.map(article => {
            // Buscar el primer bloque de contenido tipo texto
            const firstTextBlock = article.contentBlocks.find(block => block.type === 'text');

            // Crear el resumen a partir del primer bloque de texto, cortándolo a 150 caracteres
            const summary = firstTextBlock ? firstTextBlock.content.substring(0, 150) + '...' : 'Sin contenido textual disponible';

            return {
                ...article.toObject(),  // Convertir el artículo a un objeto plano
                summary  // Agregar el campo de resumen dinámico
            };
        });

        res.status(200).json(articlesWithSummary);
    } catch (error) {
        console.error('Error al obtener los artículos pendientes:', error);
        res.status(500).json({ error: 'Error al obtener los artículos pendientes.' });
    }
};

// Agregar un comentario a un artículo
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const articleId = req.params.articleId;

    const newComment = await Comment.create({
      content,
      articleId,
      userId: req.user._id,
      userAvatar: req.user.avatar,  // Obtener el avatar de Google
      username: req.user.displayName  // Obtener el nombre del usuario de Google
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar comentario.' });
  }
};

// Obtener los comentarios de un artículo
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.articleId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios.' });
  }
};
