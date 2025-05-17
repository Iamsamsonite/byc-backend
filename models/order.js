 // C:/Users/HP/Desktop/desktop/bycbackend/models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return v && v !== 'null' && v.trim().length > 0;
      },
      message: 'Order ID cannot be null or empty',
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cartItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      selectedColor: { type: String },
      selectedSize: { type: String },
    },
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    companyName: { type: String },
    country: { type: String, required: true },
    townCity: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  paymentReference: { type: String },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'processing', 'out for delivery', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Order', orderSchema);

