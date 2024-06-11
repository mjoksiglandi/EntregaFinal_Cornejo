const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const cartsFilePath = path.join(__dirname, '../data/carrito.json');


const readCarts = () => {
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data);
};


const writeCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};


router.get('/', (req, res) => {
    const carts = readCarts();
    res.json(carts);
});


router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cartId = parseInt(req.params.cid);
    const cart = carts.find(c => c.id === cartId);

    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Cart not found');
    }
});


router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
        products: []
    };

    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});


router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const cart = carts.find(c => c.id === cartId);

    if (cart) {
        const productIndex = cart.products.findIndex(p => p.product === productId);
        if (productIndex !== -1) {
      
            cart.products[productIndex].quantity += 1;
        } else {
         
            cart.products.push({ product: productId, quantity: 1 });
        }
        writeCarts(carts);
        res.status(201).json(cart);
    } else {
        res.status(404).send('Cart not found');
    }
});

router.delete('/:cid', (req, res) => {
    const carts = readCarts();
    const cartId = parseInt(req.params.cid);
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex !== -1) {
        const deletedCart = carts.splice(cartIndex, 1);
        writeCarts(carts);
        res.json(deletedCart);
    } else {
        res.status(404).send('Cart not found');
    }
});

module.exports = router;
