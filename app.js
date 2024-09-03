require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./config/googleAuth');

const app = express();

// Configurar sesiones
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/', require('./src/routes/index'));

// Configurar la carpeta 'public' como directorio estático
app.use(express.static('public'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en marcha en el puerto ${PORT}`);
});
