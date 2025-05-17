const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    console.log('Entering POST /orders'); // Debug
    console.log('req.user:', req.user); // Debug
    console.log('Request body:', req.body); // Debug

    if (!req.user || !req.user._id) {
      console.log('Access denied: req.user:', req.user); // Debug
      return res.status(403).json({ message: 'Access denied: Invalid or missing user' });
    }

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

    // Validate required fields
    if (!orderId || orderId === 'null' || orderId.trim() === '') {
      console.log('Invalid orderId:', orderId); // Debug
      return res.status(400).json({ message: 'Order ID is required and cannot be null or empty' });
    }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('Invalid cartItems:', cartItems); // Debug
      return res.status(400).json({ message: 'Cart items must be a non-empty array' });
    }
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      console.log('Invalid shippingAddress:', shippingAddress); // Debug
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    if (!paymentMethod || !subtotal || !deliveryFee || !totalAmount || !orderDate) {
      console.log('Missing fields:', { paymentMethod, subtotal, deliveryFee, totalAmount, orderDate }); // Debug
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate shippingAddress subfields
    const { fullName, country, townCity, state, phone, email } = shippingAddress;
    if (!fullName || !country || !townCity || !state || !phone || !email) {
      console.log('Invalid shippingAddress subfields:', shippingAddress); // Debug
      return res.status(400).json({ message: 'Shipping address must include fullName, country, townCity, state, phone, and email' });
    }

    // Validate cartItems
    const validatedCartItems = cartItems.map((item) => {
      if (!item.product || !item.quantity || !item.name || !item.price) {
        console.log('Invalid cart item:', item); // Debug
        throw new Error('Each cart item must have product, quantity, name, and price');
      }
      return {
        product: item.product,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      };
    });

    const user = req.user._id;
    console.log('User ID:', user); // Debug

    // Verify user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      console.log('User not found:', user); // Debug
      return res.status(400).json({ message: 'Invalid user ID' });
    }

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

    console.log('Order before save:', order); // Debug
    await order.save();
    console.log('Order saved successfully'); // Debug

    // Populate cartItems.product
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'cartItems.product',
      select: 'productName productPrice',
    });

    // Handle cases where product is null
    const responseOrder = {
      ...populatedOrder.toObject(),
      cartItems: populatedOrder.cartItems.map((item) => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        name: item.name || (item.product?.productName ?? 'Unknown Product'),
        price: typeof item.price === 'number' ? item.price : (item.product?.productPrice ?? 0),
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
    };

    res.status(201).json({ order: responseOrder });
  } catch (err) {
    console.error('Error creating order:', err); // Debug
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      console.error('Validation errors:', errors); // Debug
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err.code === 11000) {
      console.log('Duplicate orderId:', req.body.orderId); // Debug
      return res.status(400).json({ message: `Duplicate orderId: ${req.body.orderId}` });
    }
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
});

module.exports = router;