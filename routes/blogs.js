const {Blog, validateBlog} = require('../models/blog');
const express = require('express');
const router = express.Router();

// GET /api/blogs
router.get('/', async (req, res) => {
    const blogs = await Blog.find().sort('blogTitle');
    res.send(blogs);
});

// GET/api/blogs/:id
router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send('The blog with the given ID was not found.');
    res.send(blog);
});

// POST /api/blogs
router.post('/', async (req, res) => {
    const { error } = validateBlog(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let blog = new Blog({
        blogImage: req.body.blogImage,
        blogTitle: req.body.blogTitle,
        blogDescription: req.body.blogDescription,
        authorImage: req.body.authorImage,
        authorName: req.body.authorName,
        authorProfession: req.body.authorProfession,
        likes: req.body.likes,
        views: req.body.views
    });
    
    blog = await blog.save();
    res.send(blog);
});

// PUT /api/blogs/:id
router.put('/:id', async (req, res) => {
    const { error } = validateBlog(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const blog = await Blog.findByIdAndUpdate(req.params.id, {
        blogImage: req.body.blogImage,
        blogTitle: req.body.blogTitle,
        blogDescription: req.body.blogDescription,
        authorImage: req.body.authorImage,
        authorName: req.body.authorName,
        authorProfession: req.body.authorProfession,
        likes: req.body.likes,
        views: req.body.views
    }, { new: true });

    if (!blog) return res.status(404).send('The blog with the given ID was not found.');
    res.send(blog);
});

// DELETE /api/blogs/:id
router.delete('/:id', async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) return res.status(404).send('The blog with the given ID was not found.');
    res.send(blog);
});

 
module.exports = router;
// module.exports.Blog = Blog;
// module.exports.validate = validateBlog;
// module.exports = router;