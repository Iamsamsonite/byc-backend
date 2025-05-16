 // C:/Users/HP/Desktop/desktop/bycbackend/models/blog.js

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  blogImage: {
    type: [String],
    required: true
  },
  blogTitle: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  blogDescription: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  authorImage: {
    type: [String],
    required: true
  },
  authorName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  authorProfession: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  likes: {
    type: Number,
    required: true,
    default: 0
  },
  views: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

 module.exports = Blog;
 