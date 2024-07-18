const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Obtener productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, category, availability } = req.query;

        const filter = {};
        if (query) {
            filter.title = new RegExp(query, 'i');
        }
        if (category) {
            filter.category = category;
        }
        if (availability) {
            filter.status = availability === 'true';
        }

        const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        const currentPage = parseInt(page);

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip((currentPage - 1) * limit)
            .limit(parseInt(limit));

        const hasPrevPage = currentPage > 1;
        const hasNextPage = currentPage < totalPages;

        res.status(200).json({
            status: 'success',
            payload: products,
            totalPages: totalPages,
            prevPage: hasPrevPage ? currentPage - 1 : null,
            nextPage: hasNextPage ? currentPage + 1 : null,
            page: currentPage,
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
            prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${currentPage - 1}&sort=${sort}&query=${query}&category=${category}&availability=${availability}` : null,
            nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${currentPage + 1}&sort=${sort}&query=${query}&category=${category}&availability=${availability}` : null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener productos', error });
    }
});

module.exports = router;
