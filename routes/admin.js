 // C:/Users/HP/Desktop/desktop/bycbackend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');
const Blog = require('../models/blog');
const { validateBlog } = require('../models/blog');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const users = await User.countDocuments();
    const orders = await Order.countDocuments();
    const products = await Product.countDocuments();
    const blogs = await Blog.countDocuments();
    res.json({ users, orders, products, blogs });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get list of users
router.get('/users', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const users = await User.find().select('name emailAddress isAdmin createdAt');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update user role
router.patch('/users/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete user
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get list of orders
router.get('/orders', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const orders = await Order.find().populate('user', 'name emailAddress').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update order status
router.patch('/orders/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { status } = req.body;
    if (!['pending', 'out for delivery', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete order
router.delete('/orders/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Create order
router.post('/orders', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { orderId, user, cartItems, shippingAddress, paymentMethod, subtotal, deliveryFee, totalAmount, status } = req.body;
    if (!orderId || !user || !cartItems || !shippingAddress || !paymentMethod || !subtotal || !deliveryFee || !totalAmount) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const userExists = await User.findById(user);
    if (!userExists) return res.status(400).json({ message: 'Invalid user ID' });
    const order = new Order({
      orderId,
      user,
      cartItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      totalAmount,
      status: status || 'pending',
      orderDate: new Date()
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get list of products
router.get('/products', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Create product
router.post('/products', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { productName, productNumber, productDescription, productPrice, category, productStock, productImage, colors, sizes } = req.body;
    const product = new Product({
      productName,
      productNumber,
      productDescription,
      productPrice,
      category,
      productStock,
      productImage,
      colors,
      sizes
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update product
router.put('/products/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete product
router.delete('/products/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get list of blogs
router.get('/blogs', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Create blog
router.post('/blogs', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { error } = validateBlog(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update blog
router.put('/blogs/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { error } = validateBlog(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    Object.assign(blog, req.body);
    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error('Error updating blog:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete blog
router.delete('/blogs/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    console.error('Error deleting blog:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;