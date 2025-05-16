 // C:/Users/HP/Desktop/desktop/bycbackend/routes/blogs.js
const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const { validateBlog } = require('../models/blog');

console.log('Blog model:', Blog);

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log('Public blogs fetched:', blogs.length);
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err.message, err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.error('Blog not found:', req.params.id);
      return res.status(404).json({ message: 'Blog not found' });
    }
    // Increment views
    blog.views += 1;
    await blog.save();
    console.log('Blog fetched:', blog.blogTitle);
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err.message, err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;