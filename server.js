const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 8080;

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

// Ruta de ejemplo para renderizar una vista con Handlebars
app.get('/', (req, res) => {
    res.render('home', { title: 'Página de Inicio', message: '¡Bienvenido a la página de inicio!' });
});

// Ruta para manejar productos
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// Ruta para manejar carritos
const cartsRouter = require('./routes/carts');
app.use('/api/carts', cartsRouter);

// Ruta para renderizar la vista en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

// Escuchar las conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar lista de productos al cliente
    socket.emit('products', readProducts());

    // Escuchar cuando un cliente agrega un nuevo producto
    socket.on('newProduct', (product) => {
        const products = readProducts();
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            ...product
        };
        products.push(newProduct);
        writeProducts(products);

        // Enviar lista actualizada de productos a todos los clientes
        io.emit('products', products);
    });

    // Escuchar cuando un cliente elimina un producto
    socket.on('deleteProduct', (productId) => {
        const products = readProducts();
        const productIndex = products.findIndex(p => p.id === parseInt(productId));

        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            writeProducts(products);

            // Enviar lista actualizada de productos a todos los clientes
            io.emit('products', products);
        }
    });

    // Manejar la desconexión
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Funciones para leer y escribir productos
const productsFilePath = path.join(__dirname, 'data/productos.json');

const readProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

const writeProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
