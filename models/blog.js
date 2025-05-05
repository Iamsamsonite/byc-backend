const Joi = require('joi');
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blogImage: {
        type: [String],
        required: true,
        
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
        required: true,
         
    },

    authorName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    authorProfession : {
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

    views : {
        type: Number,
        required: true,
        default: 0
    },

});

const Blog = mongoose.model('Blog', blogSchema);

function validateBlog(blog) {
    const schema = ({
        blogImage: Joi.array().required(),
        blogTitle: Joi.string().min(5).max(50).required(),
        blogDescription: Joi.string().min(5).max(255).required(),
        authorImage: Joi.array().required(),
        authorName: Joi.string().min(5).max(50).required(),
        authorProfession : Joi.string().min(5).max(50).required(),
        likes: Joi.number().default(0),
        views : Joi.number().default(0),
    });

    return Joi.validate(blog, schema);
}

exports.Blog = Blog;
exports.validateBlog = validateBlog;

