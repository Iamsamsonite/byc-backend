 const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const auth = require('../middleware/auth');

// POST /orders
router.post('/', auth, async (req, res) => {
  try {
    console.log('Entering POST /orders');
    console.log('req.user:', req.user);
    console.log('Request body:', req.body);

    if (!req.user || !req.user._id) {
      console.log('Access denied: req.user:', req.user);
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
      console.log('Invalid orderId:', orderId);
      return res.status(400).json({ message: 'Order ID is required and cannot be null or empty' });
    }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('Invalid cartItems:', cartItems);
      return res.status(400).json({ message: 'Cart items must be a non-empty array' });
    }
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      console.log('Invalid shippingAddress:', shippingAddress);
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    if (!paymentMethod || !subtotal || !deliveryFee || !totalAmount || !orderDate) {
      console.log('Missing fields:', { paymentMethod, subtotal, deliveryFee, totalAmount, orderDate });
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate shippingAddress subfields
    const { fullName, country, townCity, state, phone, email } = shippingAddress;
    if (!fullName || !country || !townCity || !state || !phone || !email) {
      console.log('Invalid shippingAddress subfields:', shippingAddress);
      return res.status(400).json({ message: 'Shipping address must include fullName, country, townCity, state, phone, and email' });
    }

    // Validate cartItems
    const validatedCartItems = cartItems.map((item) => {
      if (!item.product || !item.quantity || !item.name || !item.price) {
        console.log('Invalid cart item:', item);
        throw new Error('Each cart item must have product, quantity, name, and price');
      }
      return {
        product: item.product,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        productImage: item.productImage, // Added for ProfilePage
      };
    });

    const user = req.user._id;
    console.log('User ID:', user);

    // Verify user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      console.log('User not found:', user);
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

    console.log('Order before save:', order);
    await order.save();
    console.log('Order saved successfully');

    // Populate cartItems.product
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'cartItems.product',
      select: 'productName productPrice productImage',
    });

    // Handle cases where product is null
    const responseOrder = {
      ...populatedOrder.toObject(),
      cartItems: populatedOrder.cartItems.map((item) => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        name: item.name || (item.product?.productName ?? 'Unknown Product'),
        price: typeof item.price === 'number' ? item.price : (item.product?.productPrice ?? 0),
        productImage: item.productImage || (item.product?.productImage ?? 'https://via.placeholder.com/300?text=No+Image'),
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
    };

    res.status(201).json({ order: responseOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err.code === 11000) {
      console.log('Duplicate orderId:', req.body.orderId);
      return res.status(400).json({ message: `Duplicate orderId: ${req.body.orderId}` });
    }
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
});

// GET orders for authenticated user
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch orders with pagination
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'cartItems.product',
        select: 'productName productPrice productImage',
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Handle null products in cartItems
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      cartItems: order.cartItems.map(item => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        name: item.name || (item.product?.productName ?? 'Unknown Product'),
        price: typeof item.price === 'number' ? item.price : (item.product?.productPrice ?? 0),
        productImage: item.productImage || (item.product?.productImage ?? 'https://via.placeholder.com/300?text=No+Image'),
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
    }));

    // Get total orders for pagination
    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.json({
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        limit,
      },
    });
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// GET orders by user ID (for admins)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.user;

    // Check if user is admin or accessing their own orders
    if (user._id.toString() !== userId && !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: You can only view your own orders or must be an admin' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch orders with pagination
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'cartItems.product',
        select: 'productName productPrice productImage',
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Handle null products in cartItems
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      cartItems: order.cartItems.map(item => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        name: item.name || (item.product?.productName ?? 'Unknown Product'),
        price: typeof item.price === 'number' ? item.price : (item.product?.productPrice ?? 0),
        productImage: item.productImage || (item.product?.productImage ?? 'https://via.placeholder.com/300?text=No+Image'),
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
    }));

    // Get total orders for pagination
    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.json({
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        limit,
      },
    });
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

module.exports = router;