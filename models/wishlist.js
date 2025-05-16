const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: String,
      productName: String,
      productCode: String,
      productDescription: String,
      productPrice: String,
      productImage: String,
      ratings: String,
    },
  ],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
