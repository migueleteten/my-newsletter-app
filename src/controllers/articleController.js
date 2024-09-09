const Section = require('../models/sectionModel');  // Asegúrate de importar el modelo Section
const Article = require('../models/articleModel');  // Importar el modelo Article
const mongoose = require('mongoose');  // Asegúrate de importar mongoose

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

// Buscar artículos por palabra clave, sección o subsección
exports.searchArticles = async (req, res) => {
    try {
        const { query, sectionId, subsectionId } = req.query;

        // Dividir la consulta en palabras individuales
        const keywords = query ? query.split(' ').filter(Boolean) : [];

        // Construir el filtro de búsqueda dinámicamente
        const searchFilter = [];

        // Para cada palabra clave, buscamos coincidencias en los campos título, etiquetas y bloques de contenido
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'i');  // Expresión regular insensible a mayúsculas
            searchFilter.push({
                $or: [
                    { title: { $regex: regex } },  // Buscar en el título
                    { tags: { $regex: regex } },   // Buscar en las etiquetas
                    {
                        contentBlocks: {
                            $elemMatch: {
                                type: 'text',  // Solo buscar en bloques de texto
                                content: { $regex: regex }
                            }
                        }
                    }
                ]
            });
        });

        // Filtrar por etiqueta si se proporciona
        if (tag) {
            searchFilter.tags = { $regex: tag, $options: 'i' };  // Búsqueda insensible a mayúsculas en las etiquetas
        }

        // Filtro de sección y subsección si existen
        if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
            searchFilter.push({ sectionId });
        }
        if (subsectionId && mongoose.Types.ObjectId.isValid(subsectionId)) {
            searchFilter.push({ subsectionId });
        }

        // Buscar los artículos que coincidan con el filtro
        const articles = await Article.find({
            $and: searchFilter  // Utilizar $and para asegurarse de que todas las palabras se busquen
        });

        // Calcular relevancia de cada artículo
        const articlesWithRelevance = articles.map(article => {
            let relevance = 0;

            // Calcular relevancia en el título
            keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'i');
                if (regex.test(article.title)) {
                    relevance += 10;  // Mayor peso en el título
                }
                if (article.tags.some(tag => regex.test(tag))) {
                    relevance += 5;  // Peso medio para las etiquetas
                }

                // Buscar coincidencias en los bloques de contenido de texto
                article.contentBlocks.forEach(block => {
                    if (block.type === 'text' && regex.test(block.content)) {
                        relevance += 3;  // Menor peso en bloques de contenido
                    }
                });
            });

            return { ...article._doc, relevance };  // Retornar el artículo con su relevancia
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