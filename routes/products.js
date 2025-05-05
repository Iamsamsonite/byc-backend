const {Product, validateProduct} = require('../models/product');
const express = require('express');
const router = express.Router();
const { Category } = require('../models/category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', async (req, res) => {
    const products = await Product.find().sort('productName');
    res.send(products);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('The product with the given ID was not found.');
    res.send(product);
});

router.post('/', auth, admin, async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const category = await Category.findById(req.body.categoryId);
    if (!category) return res.status(400).send('Invalid category.');

    let product = new Product ({
        productName: req.body.productName,
        productNumber: req.body.productNumber,
        
        category: {
            _id: category._id,
            name: category.name
        },
        productPrice: req.body.productPrice,
        productStock: req.body.productStock,
        productImage: req.body.productImage,
        productDescription: req.body.productDescription
    });

    product = await product.save();
    res.send(product);

});

router.put('/:id', async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const product = await Product.findByIdAndUpdate(req.params.id, {
        productName: req.body.productName,
        productNumber: req.body.productNumber,
        category: req.body.category,
        productPrice: req.body.productPrice,
        productStock: req.body.productStock,
        productImage: req.body.productImage,
        productDescription: req.body.productDescription
    }, { new: true });

    if (!product) return res.status(404).send('The product with the given ID was not found.');
    res.send(product);
}
);


router.delete('/:id', [auth, admin], async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).send('The product with the given ID was not found.');
    res.send(product);
});

module.exports = router;