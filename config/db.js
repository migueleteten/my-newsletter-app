const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/newsletter_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Base de datos conectada correctamente');
    } catch (error) {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
