const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/productos.json');

// Leer productos del archivo
const readProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Escribir productos en el archivo
const writeProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Obtener todos los productos, con limitación opcional
router.get('/', (req, res) => {
    const products = readProducts();
    const limit = parseInt(req.query.limit);

    if (limit && !isNaN(limit)) {
        res.json(products.slice(0, limit));
    } else {
        res.json(products);
    }
});

// Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.pid);
    const product = products.find(p => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
});

// Crear un nuevo producto
router.post('/', (req, res) => {
    const products = readProducts();
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    // Validar campos obligatorios
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send('All fields except thumbnails are required');
    }

    // Crear un nuevo producto con ID autogenerado
    const newProduct = {
        id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || []
    };

    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// Actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.pid);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
        const updatedProduct = { ...products[productIndex], ...req.body };
        updatedProduct.id = products[productIndex].id; // Asegurar que el ID no cambie
        products[productIndex] = updatedProduct;
        writeProducts(products);
        res.json(updatedProduct);
    } else {
        res.status(404).send('Product not found');
    }
});

// Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.pid);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
        const deletedProduct = products.splice(productIndex, 1);
        writeProducts(products);
        res.json(deletedProduct);
    } else {
        res.status(404).send('Product not found');
    }
});

module.exports = router;
