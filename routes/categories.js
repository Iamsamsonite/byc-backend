// const express = require('express');
// const router = express.Router();
// const { Category, validateCategory } = require('../models/category');
// const auth = require('../middleware/auth');
// const admin = require('../middleware/admin');




// // GET /api/categories
// router.get('/', async (req, res) => {
//     const categories = await Category.find().sort('name');
//     res.send(categories);
// });

// // GET /api/categories/:id
// router.get('/:id', async (req, res) => {
//     const category = await Category.findById(req.params.id);
//     if (!category) return res.status(404).send('The category with the given ID was not found.');
//     res.send(category);
// });

// // POST /api/categories
// router.post('/', auth, async (req, res) => {
//     const { error } = validateCategory(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     let category = new Category({
//         name: req.body.name,
//     });
//     category = await category.save();

//     res.send(category);
// });

// // PUT /api/categories/:id
// router.put('/:id', async (req, res) => {
//     const { error } = validateCategory(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     const category = await Category.findByIdAndUpdate(req.params.id, {
//         name: req.body.name,
//     }, { new: true });

//     if (!category) return res.status(404).send('The category with the given ID was not found.');

//     res.send(category);
// }
// );

// // DELETE /api/categories/:id
// router.delete('/:id', [auth, admin], async (req, res) => { 
//     const category = await Category.findByIdAndDelete(req.params.id);

//     if (!category) return res.status(404).send('The category with the given ID was not found.');

//     res.send(category);
// }
// );


// module.exports = router;

 // backend/routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const adminAuth = require('../middleware/admin-auth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add category (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;