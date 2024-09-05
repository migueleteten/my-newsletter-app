const mongoose = require('mongoose');
require('dotenv').config();

// Configurar strictQuery
mongoose.set('strictQuery', true); // O false, dependiendo de lo que prefiera

// Opciones de configuración para la conexión a MongoDB
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Aumenta el timeout a 30 segundos
};

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1); // Salir del proceso con error
    }
};

module.exports = connectDB;
