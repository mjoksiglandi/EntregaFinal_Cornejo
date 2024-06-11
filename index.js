const express = require('express');
const app = express();
const port = 8080;

// Importar rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
