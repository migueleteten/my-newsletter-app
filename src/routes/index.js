const express = require('express');
const router = express.Router();
const passport = require('passport');
const path = require('path');


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

router.get('/admin/dashboard', (req, res) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));
    } else {
        res.redirect('/');
    }
});

router.get('/partials/header.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/partials/header.html'));
});

router.get('/partials/footer.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/partials/footer.html'));
});

router.get('/admin/sections', (req, res) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        res.sendFile(path.join(__dirname, '../views/admin/sections.html'));
    } else {
        res.redirect('/');
    }
});

module.exports = router;
