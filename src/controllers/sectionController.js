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
        const { sectionId } = req.params; // Obtener el ID de la sección
        const { title } = req.body; // Obtener el título de la subsección

        // Validar que el título esté presente
        if (!title) {
            return res.status(400).json({ error: 'El título es obligatorio.' });
        }

        // Buscar la sección por su ID
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }

        // Añadir la subsección al array de subsecciones de la sección
        section.subsections.push({ title });
        await section.save(); // Guardar la sección con la nueva subsección

        res.status(201).json({ message: 'Subsección añadida correctamente.' });
    } catch (error) {
        console.error('Error al añadir la subsección:', error);
        res.status(500).json({ error: 'Error al añadir la subsección.' });
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

// Editar una sección existente
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

// Obtener una subsección específica
exports.getSubsection = async (req, res) => {
    try {
        const { sectionId, subsectionId } = req.params;

        // Buscar la sección por su ID
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }

        // Buscar la subsección dentro de la sección
        const subsection = section.subsections.id(subsectionId);
        if (!subsection) {
            return res.status(404).json({ error: 'Subsección no encontrada.' });
        }

        // Devolver la subsección encontrada
        res.status(200).json(subsection);
    } catch (error) {
        console.error('Error al obtener la subsección:', error);
        res.status(500).json({ error: 'Error al obtener la subsección.' });
    }
};

// Editar una subsección existente
exports.editSubsection = async (req, res) => {
    try {
        const { sectionId, subsectionId } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'El título es obligatorio.' });
        }

        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }

        const subsection = section.subsections.id(subsectionId);
        if (!subsection) {
            return res.status(404).json({ error: 'Subsección no encontrada.' });
        }

        subsection.title = title; // Actualizar el título de la subsección
        await section.save();

        res.status(200).json({ message: 'Subsección actualizada correctamente.' });
    } catch (error) {
        console.error('Error al editar la subsección:', error);
        res.status(500).json({ error: 'Error al editar la subsección.' });
    }
};

// Eliminar una subsección
exports.deleteSubsection = async (req, res) => {
    try {
        const { sectionId, subsectionId } = req.params;

        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ error: 'Sección no encontrada.' });
        }

        // Eliminar la subsección
        section.subsections.id(subsectionId).remove();
        await section.save();

        res.status(200).json({ message: 'Subsección eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar la subsección:', error);
        res.status(500).json({ error: 'Error al eliminar la subsección.' });
    }
};
