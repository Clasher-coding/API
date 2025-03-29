const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountPrice: { type: Number, default: null }, 
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  isBestSeller: { type: Boolean, default: false },
  isSpecialOffer: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false }, 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
