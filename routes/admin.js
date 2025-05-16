 // C:/Users/HP/Desktop/desktop/bycbackend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');
const Blog = require('../models/blog');
const Category = require('../models/category');
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

// Get sales statistics
router.get('/sales', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const dailySales = await Order.aggregate([
      { $match: { orderDate: { $gte: new Date(new Date().setHours(0, 0, 0)) } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const monthlySales = await Order.aggregate([
      { $match: { orderDate: { $gte: new Date(new Date().setDate(1)) } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const yearlySales = await Order.aggregate([
      { $match: { orderDate: { $gte: new Date(new Date().setMonth(0, 1)) } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    res.json({
      daily: dailySales[0]?.total || 0,
      monthly: monthlySales[0]?.total || 0,
      yearly: yearlySales[0]?.total || 0,
    });
  } catch (err) {
    console.error('Error fetching sales:', err.message);
    res.status(500).json({ message: 'Failed to fetch sales data', error: err.message });
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
    const orders = await Order.find()
      .populate('user', 'name emailAddress')
      .populate({
        path: 'cartItems.product',
        select: 'productName productImage colors sizes',
        populate: { path: 'category', select: 'name' },
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
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
    // Validate cartItems
    for (const item of cartItems) {
      if (!item.product || !item.quantity || !item.name || !item.price) {
        return res.status(400).json({ message: 'Each cart item must have product, quantity, name, and price' });
      }
      const productExists = await Product.findById(item.product);
      if (!productExists) return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      // Validate selectedColor and selectedSize if provided
      if (item.selectedColor && !productExists.colors.some(c => c.name === item.selectedColor)) {
        return res.status(400).json({ message: `Invalid color: ${item.selectedColor}` });
      }
      if (item.selectedSize && !productExists.sizes.includes(item.selectedSize)) {
        return res.status(400).json({ message: `Invalid size: ${item.selectedSize}` });
      }
    }
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
      orderDate: new Date(),
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err.message);
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

// Get product by ID
router.get('/products/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get list of products
router.get('/products', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 });
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

    // Validation
    if (!productName) return res.status(400).json({ message: 'Product name is required' });
    if (!productPrice || productPrice <= 0) return res.status(400).json({ message: 'Valid price is required' });
    if (!category) return res.status(400).json({ message: 'Category is required' });
    if (productStock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ message: 'Invalid category ID' });

    // Normalize and validate colors
    if (!Array.isArray(colors)) {
      return res.status(400).json({ message: 'Colors must be an array' });
    }
    const normalizedColors = colors.map(color => {
      if (typeof color === 'object' && color.name && color.code) {
        return { name: String(color.name), code: String(color.code) };
      }
      return { name: String(color), code: '' }; // Fallback for strings or invalid objects
    });
    if (normalizedColors.some(color => !color.name || !color.code)) {
      return res.status(400).json({ message: 'All colors must have a name and code' });
    }

    // Normalize sizes
    const normalizedSizes = Array.isArray(sizes) ? sizes.map(size => String(size)) : [];

    const product = new Product({
      productName,
      productNumber,
      productDescription,
      productPrice,
      category,
      productStock,
      productImage: Array.isArray(productImage) ? productImage : [],
      colors: normalizedColors,
      sizes: normalizedSizes,
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
    const { productName, productNumber, productDescription, productPrice, category, productStock, productImage, colors, sizes } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Validation
    if (!productName) return res.status(400).json({ message: 'Product name is required' });
    if (!productPrice || productPrice <= 0) return res.status(400).json({ message: 'Valid price is required' });
    if (!category) return res.status(400).json({ message: 'Category is required' });
    if (productStock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ message: 'Invalid category ID' });

    // Normalize and validate colors
    if (!Array.isArray(colors)) {
      return res.status(400).json({ message: 'Colors must be an array' });
    }
    const normalizedColors = colors.map(color => {
      if (typeof color === 'object' && color.name && color.code) {
        return { name: String(color.name), code: String(color.code) };
      }
      return { name: String(color), code: '' }; // Fallback for strings or invalid objects
    });
    if (normalizedColors.some(color => !color.name || !color.code)) {
      return res.status(400).json({ message: 'All colors must have a name and code' });
    }

    // Normalize sizes
    const normalizedSizes = Array.isArray(sizes) ? sizes.map(size => String(size)) : [];

    Object.assign(product, {
      productName,
      productNumber,
      productDescription,
      productPrice,
      category,
      productStock,
      productImage: Array.isArray(productImage) ? productImage : [],
      colors: normalizedColors,
      sizes: normalizedSizes,
    });
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

// Get all categories
router.get('/categories', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Create a category
router.post('/categories', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return res.status(400).json({ message: 'Category already exists' });
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update a category
router.patch('/categories/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existingCategory) return res.status(400).json({ message: 'Category name already exists' });
    category.name = name;
    await category.save();
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete a category
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const products = await Product.find({ category: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category used by products' });
    }
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get all blogs
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

// Create a blog
router.post('/blogs', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { blogImage, blogTitle, blogDescription, authorImage, authorName, authorProfession, likes, views } = req.body;
    if (!blogTitle || !blogDescription || !authorName || !authorProfession) {
      return res.status(400).json({ message: 'Title, description, author name, and profession are required' });
    }
    const blog = new Blog({
      blogImage: blogImage || [''],
      blogTitle,
      blogDescription,
      authorImage: authorImage || [''],
      authorName,
      authorProfession,
      likes: likes || 0,
      views: views || 0,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update a blog
router.patch('/blogs/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const { blogImage, blogTitle, blogDescription, authorImage, authorName, authorProfession, likes, views } = req.body;
    if (!blogTitle || !blogDescription || !authorName || !authorProfession) {
      return res.status(400).json({ message: 'Title, description, author name, and profession are required' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.blogImage = blogImage || blog.blogImage;
    blog.blogTitle = blogTitle;
    blog.blogDescription = blogDescription;
    blog.authorImage = authorImage || blog.authorImage;
    blog.authorName = authorName;
    blog.authorProfession = authorProfession;
    blog.likes = likes !== undefined ? likes : blog.likes;
    blog.views = views !== undefined ? views : blog.views;
    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error('Error updating blog:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete a blog
router.delete('/blogs/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    console.error('Error deleting blog:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;