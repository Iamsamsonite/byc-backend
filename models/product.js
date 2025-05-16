 // C:/Users/HP/Desktop/desktop/bycbackend/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productNumber: {
    type: String,
    unique: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0
  },
  productStock: {
    type: Number,
    default: 0,
    min: 0
  },
  productImage: {
    type: [String],
    default: []
  },
  productDescription: {
    type: String,
    trim: true
  },
  ratings: {
    type: Number,
    default: 0
  },
  sizes: {
    type: [String],
    default: []
  },
  colors: [{
    name: { type: String, required: true },
    code: { type: String, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;