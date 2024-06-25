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


app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('home', { title: 'Página de Inicio', message: '¡Bienvenido a la página de inicio!' });
});


const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);


const cartsRouter = require('./routes/carts');
app.use('/api/carts', cartsRouter);


app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});


io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    
    socket.emit('products', readProducts());

    
    socket.on('newProduct', (product) => {
        const products = readProducts();
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            ...product
        };
        products.push(newProduct);
        writeProducts(products);

        
        io.emit('products', products);
    });

   
    socket.on('deleteProduct', (productId) => {
        const products = readProducts();
        const productIndex = products.findIndex(p => p.id === parseInt(productId));

        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            writeProducts(products);

            
            io.emit('products', products);
        }
    });

    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


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
