const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  ProductName: String,
  Price: Number,
});

module.exports = mongoose.model('Product', ProductSchema);