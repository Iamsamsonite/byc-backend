const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const RecentView = require('../models/recentView');

// Define a constant guest user ID (replace with actual ObjectId after creating guest user)
const GUEST_USER_ID = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'); // Placeholder, update after creating guest user

let auth;
try {
  auth = require('../middleware/auth'); // Attempt to load auth middleware
} catch (err) {
  console.warn('Auth middleware not found, routes will be unauthenticated');
  auth = (req, res, next) => next(); // Fallback to no auth
}

// Get recently viewed products
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id || GUEST_USER_ID;
    console.log(`GET /api/byc/recentviews called for user: ${userId}`);
    const recentView = await RecentView.findOne({ userId });
    res.json(recentView ? recentView.products : []);
  } catch (err) {
    console.error('Error fetching recent views:', err);
    res.status(500).json({ message: 'Error fetching recent views', error: err.message });
  }
});

// Add a product to recently viewed
router.post('/', auth, async (req, res) => {
  const {
    productId,
    productName,
    productCode,
    productDescription,
    productPrice,
    productImage,
    ratings,
  } = req.body;

  // Basic input validation
  if (!productId || !productName || !productCode || !productPrice) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userId = req.user?.id || GUEST_USER_ID;
    console.log(`POST /api/byc/recentviews called for user: ${userId}, body:`, req.body);
    let recentView = await RecentView.findOne({ userId });
    if (!recentView) {
      recentView = new RecentView({ userId, products: [] });
    }

    // Remove if already exists to update position (recent first)
    recentView.products = recentView.products.filter((p) => p.productId !== productId);

    // Add new product at the start (limit to 5)
    recentView.products.unshift({
      productId,
      productName,
      productCode,
      productDescription: productDescription || '',
      productPrice,
      productImage: productImage || '',
      ratings: ratings || '0',
      viewedAt: new Date(),
    });

    if (recentView.products.length > 5) {
      recentView.products = recentView.products.slice(0, 5);
    }

    await recentView.save();
    res.json(recentView.products);
  } catch (err) {
    console.error('Error adding to recent views:', err);
    res.status(500).json({ message: 'Error adding to recent views', error: err.message });
  }
});

// Remove a product from recently viewed
router.delete('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user?.id || GUEST_USER_ID;
    console.log(`DELETE /api/byc/recentviews/:productId called with ID: ${req.params.productId}, user: ${userId}`);
    const recentView = await RecentView.findOne({ userId });
    if (!recentView) {
      return res.status(404).json({ message: 'Recent views not found' });
    }

    recentView.products = recentView.products.filter(
      (p) => p.productId !== req.params.productId
    );
    await recentView.save();
    res.json(recentView.products);
  } catch (err) {
    console.error('Error removing from recent views:', err);
    res.status(500).json({ message: 'Error removing from recent views', error: err.message });
  }
});

module.exports = router;