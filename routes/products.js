const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

module.exports = (io) => {
    router.get('/', async (req, res) => {
        try {
            const products = await Product.find();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener productos' });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const product = new Product(req.body);
            await product.save();
            io.emit('products', await Product.find());
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear producto' });
        }
    });

    router.delete('/:productId', async (req, res) => {
        try {
            await Product.findByIdAndDelete(req.params.productId);
            io.emit('products', await Product.find());
            res.status(200).json({ message: 'Producto eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar producto' });
        }
    });

    return router;
};
