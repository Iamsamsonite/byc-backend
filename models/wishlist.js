const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      productName: { type: String, default: '' },
      productPrice: { type: Number, default: 0 },
      productImage: { type: String, default: '' },
      productCode: { type: String, default: '' },
      productDescription: { type: String, default: '' },
      ratings: { type: Number, default: 0 },
      colors: [{ name: String, code: String, _id: mongoose.Schema.Types.ObjectId }],
      sizes: [{ type: String }],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);