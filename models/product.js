const Joi = require('joi');
const mongoose = require('mongoose');
const { categorySchema } = require('./category');

 

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    
    productNumber:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    
    category: {
        type: categorySchema,
        required: true
    },

    productPrice: {
        type: Number,
        required: true,
        min: 0
    },

    productStock: {
        type    : Number,
        required: true,
        min: 1
    },

    productImage: {
        type: [String],
        required: true,
    },

    productDescription: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },

})

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = ({
        productName: Joi.string().min(5).max(50).required(),
        productNumber: Joi.string().min(5).max(50).required(),
        categoryId: Joi.string().required(),
        productPrice: Joi.number().min(0).required(),
        productStock: Joi.number().min(1).required(),
        productImage: Joi.array().items(Joi.string()),
        productDescription: Joi.string().min(5).max(255).required()
    });

    return Joi.validate(product, schema);
}

exports.Product = Product;
exports.validateProduct = validateProduct;