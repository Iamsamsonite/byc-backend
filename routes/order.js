const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const {
      orderId,
      cartItems,
      shippingAddress,
      paymentMethod,
      paymentReference,
      subtotal,
      deliveryFee,
      totalAmount,
      orderDate,
      status,
    } = req.body;

    console.log('Request body:', req.body);

    // Validate required fields
    if (!orderId || orderId === 'null' || orderId.trim() === '') {
      return res.status(400).json({ message: 'Order ID is required and cannot be null or empty' });
    }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart items must be a non-empty array' });
    }
    if (!shippingAddress || !paymentMethod || !subtotal || !deliveryFee || !totalAmount || !orderDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate cartItems
    const validatedCartItems = cartItems.map((item) => ({
      product: item.product,
      quantity: item.quantity || 1,
      name: item.name || 'Unknown Product', // Fallback
      price: typeof item.price === 'number' ? item.price : 0, // Fallback
    }));

    const user = req.user._id;

    const order = new Order({
      orderId,
      user,
      cartItems: validatedCartItems,
      shippingAddress,
      paymentMethod,
      paymentReference,
      subtotal,
      deliveryFee,
      totalAmount,
      orderDate: new Date(orderDate),
      status: status || 'pending',
    });

    await order.save();

    // Populate cartItems.product with name and price
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'cartItems.product',
      select: 'name price',
    });

    // Merge populated data with cartItems
    const responseOrder = {
      ...populatedOrder.toObject(),
      cartItems: populatedOrder.cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        name: item.name || item.product.name || 'Unknown Product',
        price: typeof item.price === 'number' ? item.price : item.product.price || 0,
      })),
    };

    res.status(201).json({ order: responseOrder });
  } catch (err) {
    console.error('Error creating order:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: `Duplicate orderId: ${req.body.orderId}` });
    }
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
});

module.exports = router;