// routes/products.js

const express = require('express');
const Product = require('../models/Product');

module.exports = (io) => {
    const router = express.Router();

    // Obtener todos los productos
    router.get('/', async (req, res) => {
        try {
            const products = await Product.find();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener productos' });
        }
    });

    // Agregar un nuevo producto
    router.post('/', async (req, res) => {
        try {
            const newProduct = new Product(req.body);
            await newProduct.save();
            io.emit('newProduct', newProduct); // Emitir evento a través de Socket.IO
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar producto' });
        }
    });

    // Eliminar un producto por ID
    router.delete('/:id', async (req, res) => {
        try {
            const deletedProduct = await Product.findByIdAndDelete(req.params.id);
            if (deletedProduct) {
                io.emit('deleteProduct', req.params.id); // Emitir evento a través de Socket.IO
                res.json(deletedProduct);
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar producto' });
        }
    });

    return router;
};
