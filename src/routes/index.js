const express = require('express');
const router = express.Router();
const passport = require('passport');
const sectionController = require('../controllers/sectionController');
const articleController = require('../controllers/articleController');  // Agregamos el controlador de artículos
const path = require('path');

// Middleware para verificar si el usuario está autenticado
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// Middleware para verificar si el usuario es administrador
function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.redirect('/');
}

// Ruta para redirigir al usuario a Google para autenticación
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Ruta para manejar el callback de Google
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Verificar si el usuario es administrador
        if (req.user.isAdmin) {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/user/index');
        }
    }
);

// Ruta para la página de inicio de sesión
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Ruta protegida para el dashboard de administrador
router.get('/admin/dashboard', ensureAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));
});

// Rutas para cargar header y footer
router.get('/partials/header.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/partials/header.html'));
});

router.get('/partials/footer.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/partials/footer.html'));
});

// Ruta protegida para gestionar secciones (solo admin)
router.get('/admin/sections', ensureAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin/sections.html'));
});

// Ruta protegida para gestionar artículos (solo admin)
router.get('/admin/create-article', ensureAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin/create-article.html'));
});

// Rutas para gestionar secciones (API)
router.get('/api/sections', sectionController.listSections);
router.post('/api/sections', ensureAdmin, sectionController.createSection);
router.get('/api/sections/:id', sectionController.getSectionById);
router.put('/api/sections/:id', ensureAdmin, sectionController.updateSection);
router.delete('/api/sections/:id', ensureAdmin, sectionController.deleteSection);

// Rutas para gestionar subsecciones (API)
router.post('/api/sections/:sectionId/subsections', ensureAdmin, sectionController.createSubsection);
router.get('/api/sections/:sectionId/subsections/:subsectionId', sectionController.getSubsection);
router.put('/api/sections/:sectionId/subsections/:subsectionId', ensureAdmin, sectionController.editSubsection);
router.delete('/api/sections/:sectionId/subsections/:subsectionId', ensureAdmin, sectionController.deleteSubsection);

// Rutas para gestionar artículos (API)
router.get('/api/sections/:sectionId/articles', articleController.listArticlesBySection);  // Listar todos los artículos de una sección
router.post('/api/sections/:sectionId/articles', ensureAdmin, articleController.createArticle);  // Crear artículo
router.get('/api/articles/:articleId', articleController.getArticleById);  // Obtener detalles de un artículo
router.put('/api/articles/:articleId', ensureAdmin, articleController.updateArticle);  // Editar artículo
router.delete('/api/articles/:articleId', ensureAdmin, articleController.deleteArticle);  // Eliminar artículo
router.post('/api/articles/:articleId/highlight', ensureAdmin, articleController.highlightArticle);  // Destacar artículo
router.post('/api/sections/:sectionId/articles/reorder', ensureAdmin, articleController.reorderArticles);  // Reordenar artículos

module.exports = router;