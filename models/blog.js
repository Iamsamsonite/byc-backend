 // C:/Users/HP/Desktop/desktop/bycbackend/models/blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  blogImage: {
    type: [String],
    default: [''],
  },
  blogTitle: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxLength: [100, 'Blog title cannot exceed 100 characters'],
  },
  blogDescription: {
    type: String,
    required: [true, 'Blog description is required'],
    trim: true,
    maxLength: [5000, 'Blog description cannot exceed 5000 characters'],
  },
  authorImage: {
    type: [String],
    default: [''],
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxLength: [50, 'Author name cannot exceed 50 characters'],
  },
  authorProfession: {
    type: String,
    required: [true, 'Author profession is required'],
    trim: true,
    maxLength: [50, 'Author profession cannot exceed 50 characters'],
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative'],
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Blog', blogSchema);