// C:/Users/HP/Desktop/desktop/bycbackend/routes/search.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required' });

    const products = await Product.find({
      $or: [
        { productName: { $regex: q, $options: 'i' } }, // Case-insensitive search
        { productDescription: { $regex: q, $options: 'i' } }
      ]
    }).populate('category', 'name');

    res.json({ products });
  } catch (err) {
    console.error('Error searching products:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;