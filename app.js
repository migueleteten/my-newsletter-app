require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
require('./config/googleAuth');
const connectDB = require('./config/db');
const MongoStore = require('connect-mongo');

// Conectar a la base de datos
connectDB();

const app = express();

// Aumentar el límite de tamaño del body-parser
app.use(bodyParser.json({ limit: '10mb' })); // Ajusta el límite según tus necesidades
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Para datos en formato x-www-form-urlencoded

// Middleware para manejar datos JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesión para Passport.js
app.use(session({
    secret: 'tu-clave-secreta',  // Cambia esto a un valor seguro en producción
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,  // Aquí usas tu URI de conexión desde el archivo .env
        collectionName: 'sessions',  // Puedes cambiar el nombre de la colección si lo deseas
        ttl: 14 * 24 * 60 * 60  // Tiempo de vida de las sesiones, aquí 14 días
    }),
    cookie: { secure: false }  // Cambiar a true si usas HTTPS en producción
}));
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
