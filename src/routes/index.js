const express = require('express');
const router = express.Router();

// Ruta para la página principal
router.get('/', (req, res) => {
    res.render('public/index', { title: 'Inicio', sections: [] });  // Ponga aquí las secciones reales en lugar de la lista vacía.
});

// Exportar el router
module.exports = router;
