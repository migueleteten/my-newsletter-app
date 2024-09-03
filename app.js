const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Datastore = require('nedb');

// Crear una instancia de la aplicación Express
const app = express();

// Configurar NeDB (Base de Datos en Memoria)
const db = new Datastore({ filename: 'newsletter.db', autoload: true });

// Configuraciones generales
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// Ruta para la página principal
app.get('/', (req, res) => {
    db.find({}, (err, sections) => {
        if (err) {
            console.log('Error al recuperar secciones:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            res.render('public/index', { title: 'Inicio', sections });
        }
    });
});

// Ruta para añadir un artículo (solo como ejemplo)
app.post('/add-article', (req, res) => {
    const newArticle = {
        title: req.body.title,
        content: req.body.content,
        images: req.body.images ? req.body.images.split(',') : []
    };

    db.insert(newArticle, (err, newDoc) => {
        if (err) {
            console.log('Error al insertar artículo:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            res.redirect('/');
        }
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en marcha en el puerto ${PORT}`);
});
