const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');
const auth = require('../middleware/auth'); // Assume auth middleware

// Add to wishlist
router.post('/', auth, async (req, res) => {
  const { productId, productName, productCode, productDescription, productPrice, productImage, ratings } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
    }

    if (wishlist.products.some((p) => p.productId === productId)) {
      return res.json(wishlist.products); // Already in wishlist
    }

    wishlist.products.push({
      productId,
      productName,
      productCode,
      productDescription,
      productPrice,
      productImage,
      ratings,
    });

    await wishlist.save();
    res.json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter((p) => p.productId !== req.params.productId);
    await wishlist.save();
    res.json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    res.json(wishlist ? wishlist.products : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;