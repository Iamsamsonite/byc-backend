const express = require('express');
const router = express.Router();
const { Category, validateCategory } = require('../models/category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');




// GET /api/categories
router.get('/', async (req, res) => {
    const categories = await Category.find().sort('name');
    res.send(categories);
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('The category with the given ID was not found.');
    res.send(category);
});

// POST /api/categories
router.post('/', auth, async (req, res) => {
    const { error } = validateCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = new Category({
        name: req.body.name,
    });
    category = await category.save();

    res.send(category);
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    const { error } = validateCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
    }, { new: true });

    if (!category) return res.status(404).send('The category with the given ID was not found.');

    res.send(category);
}
);

// DELETE /api/categories/:id
router.delete('/:id', [auth, admin], async (req, res) => { 
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) return res.status(404).send('The category with the given ID was not found.');

    res.send(category);
}
);


module.exports = router;