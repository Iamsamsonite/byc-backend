const mongoose = require('mongoose');

const recentViewSchema = new mongoose.Schema({
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
      viewedAt: { type: Date, default: Date.now },
    },
  ],
});


module.exports = mongoose.model('RecentView', recentViewSchema);