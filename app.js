const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Configuración de la base de datos
mongoose.connect('mongodb://localhost/newsletter_db', { useNewUrlParser: true, useUnifiedTopology: true });

// Configuraciones generales
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Rutas
const indexRouter = require('./src/routes/index');
app.use('/', indexRouter);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en marcha en el puerto ${PORT}`);
});
