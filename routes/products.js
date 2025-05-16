 // C:/Users/HP/Desktop/desktop/bycbackend/routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const adminAuth = require('../middleware/admin-auth');

// Create product
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      productName,
      productNumber,
      category,
      productPrice,
      productStock,
      productImage,
      productDescription,
      ratings,
      sizes,
      colors
    } = req.body;

    console.log('Creating product with data:', req.body);
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({ message: 'Colors must be an array of objects' });
    }
    if (colors) {
      colors.forEach((color, index) => {
        if (!color.name || !color.code) {
          throw new Error(`Invalid color at index ${index}: must have name and code`);
        }
      });
    }

    const product = new Product({
      productName,
      productNumber,
      category,
      productPrice,
      productStock,
      productImage,
      productDescription,
      ratings,
      sizes,
      colors
    });

    await product.save();
    console.log('Product created:', product);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ message: `Product validation failed: ${err.message}` });
  }
});

// Get products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const products = await Product.find(query).populate('category');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      productName,
      productNumber,
      category,
      productPrice,
      productStock,
      productImage,
      productDescription,
      ratings,
      sizes,
      colors
    } = req.body;

    console.log('Updating product ID:', req.params.id);
    console.log('Received payload:', req.body);
    console.log('Colors field:', colors);

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({ message: 'Colors must be an array of objects' });
    }
    if (colors) {
      colors.forEach((color, index) => {
        if (!color.name || !color.code) {
          throw new Error(`Invalid color at index ${index}: must have name and code`);
        }
      });
    }

    const updateData = {};
    if (productName) updateData.productName = productName;
    if (productNumber) updateData.productNumber = productNumber;
    if (category) updateData.category = category;
    if (productPrice) updateData.productPrice = productPrice;
    if (productStock) updateData.productStock = productStock;
    if (productImage) updateData.productImage = productImage;
    if (productDescription) updateData.productDescription = productDescription;
    if (ratings) updateData.ratings = ratings;
    if (sizes) updateData.sizes = sizes;
    if (colors) updateData.colors = colors;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product updated:', product);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ message: `Product update failed: ${err.message}` });
  }
});

// Delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product deleted:', product);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(400).json({ message: `Product deletion failed: ${err.message}` });
  }
});

module.exports = router;