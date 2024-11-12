const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  ProductID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  Stock: Number,
});

module.exports = mongoose.model('Inventory', InventorySchema);