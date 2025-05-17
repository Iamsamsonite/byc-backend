const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const mongoose = require('mongoose');

router.get('/', auth, async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('items.product');
    if (!wishlist) {
      return res.json({ items: [] });
    }

    res.json(wishlist);
  } catch (err) {
    console.error('Error fetching wishlist:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!req.user?._id) {
      console.error('Wishlist POST: User ID not found in request');
      return res.status(401).json({ message: 'User ID not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.error('Invalid userId:', req.user._id);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('Invalid productId received:', productId);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
      await wishlist.save();
    }

    if (!wishlist.items) {
      wishlist.items = [];
    }

    const itemExists = wishlist.items.some((item) => item.product.toString() === productId);
    if (itemExists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({
      product: productId,
      productName: product.productName || 'Unknown Product',
      productPrice: product.productPrice || 0,
      productImage: product.productImage?.[0] || '',
      productCode: product.productCode || '',
      productDescription: product.productDescription || '',
      ratings: product.ratings || 0,
      colors: product.colors || [],
      sizes: product.sizes || [],
    });

    await wishlist.save();
    await wishlist.populate('items.product');
    res.status(201).json(wishlist);
  } catch (err) {
    console.error('Error adding to wishlist:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

router.delete('/:productId', auth, async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter((item) => item.product.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('items.product');
    res.json(wishlist);
  } catch (err) {
    console.error('Error removing from wishlist:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;
