const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
    const carts = await Cart.find().populate('products.product');
    res.json(carts);
});

router.get('/:cid', async (req, res) => {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Cart not found');
    }
});

router.post('/', async (req, res) => {
    const newCart = new Cart();
    await newCart.save();
    res.status(201).json(newCart);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);

    if (cart && product) {
        const productIndex = cart.products.findIndex(p => p.product.equals(req.params.pid));
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }
        await cart.save();
        res.status(201).json(cart);
    } else {
        res.status(404).send('Cart or product not found');
    }
});

router.delete('/:cid', async (req, res) => {
    const cart = await Cart.findByIdAndDelete(req.params.cid);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send('Cart not found');
    }
});

module.exports = router;
