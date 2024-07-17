const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const User = require('./models/User');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const authRouter = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 8080;

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/TestBackend', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error conectando a MongoDB', err));

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para redirigir la vista principal a realtimeproducts
app.get('/', (req, res) => {
    res.redirect('/realtimeproducts');
});

// Ruta para renderizar la vista en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

// Rutas
app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);
app.use('/auth', authRouter);

// Escuchar las conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('getProducts', async () => {
        try {
            const products = await Product.find();
            socket.emit('products', products);
        } catch (error) {
            console.error('Error obteniendo productos:', error);
        }
    });

    socket.on('newProduct', async (productData) => {
        try {
            if (typeof productData.status === 'string') {
                productData.status = productData.status === 'on';
            }
            const newProduct = new Product(productData);
            await newProduct.save();
            io.emit('products', await Product.find());
        } catch (error) {
            console.error('Error agregando nuevo producto:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await Product.findByIdAndDelete(productId);
            io.emit('products', await Product.find());
        } catch (error) {
            console.error('Error eliminando producto:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
