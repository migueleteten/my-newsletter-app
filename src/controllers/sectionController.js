const Section = require('../models/sectionModel');

// Crear una nueva sección
exports.createSection = async (req, res) => {
    try {
        const { title, color } = req.body;

        // Validar que el título y el color estén presentes
        if (!title || !color) {
            return res.status(400).json({ error: 'El título y el color son obligatorios.' });
        }

        const newSection = new Section({
            title,
            color,
            subsections: []
        });

        await newSection.save();
        res.status(201).json(newSection);
    } catch (error) {
        console.error('Error al crear la sección:', error);
        res.status(500).json({ error: 'Error al crear la sección.' });
    }
};

// Crear una subsección dentro de una sección existente
exports.createSubsection = async (req, res) => {
    try {
        const section = await Section.findById(req.params.sectionId);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }

        const newSubsection = {
            title: req.body.title
        };
        section.subsections.push(newSubsection);
        await section.save();
        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la subsección.' });
    }
};

// Listar todas las secciones y subsecciones
exports.listSections = async (req, res) => {
    try {
        const sections = await Section.find();
        res.status(200).json(sections);
    } catch (error) {
        console.error('Error al listar las secciones:', error);
        res.status(500).json({ error: 'Error al listar las secciones.' });
    }
};

// Obtener los detalles de una sección específica
exports.getSectionById = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }
        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la sección.' });
    }
};

// Editar una sección o subsección existente
exports.updateSection = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }

        section.title = req.body.title || section.title;
        section.color = req.body.color || section.color;

        await section.save();
        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la sección.' });
    }
};

// Eliminar una sección o subsección
exports.deleteSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndDelete(req.params.id);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }
        res.status(200).json({ message: 'Sección eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la sección.' });
    }
};