// importData.js
const mongoose = require('mongoose');
const Product = require('./models/Product');
const productsData = require('./data/productos.js');

mongoose.connect('mongodb://localhost:27017/TestBackend', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB conectado');
    importData();
}).catch(err => console.error('Error conectando a MongoDB', err));

const importData = async () => {
    try {
        await Product.deleteMany();
        await Product.insertMany(productsData);
        console.log('Datos importados exitosamente');
        process.exit();
    } catch (error) {
        console.error('Error importando datos:', error);
        process.exit(1);
    }
};
