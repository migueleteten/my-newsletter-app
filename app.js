require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./config/googleAuth');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware para manejar datos JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/', require('./src/routes/index'));
app.get('/api/user-role', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAdmin: req.user.isAdmin });
    } else {
        res.status(401).json({ message: 'No autenticado' });
    }
});

// Configurar la carpeta 'public' como directorio estático
app.use(express.static('public'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en marcha en el puerto ${PORT}`);
});
