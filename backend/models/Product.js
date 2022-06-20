const mongoose = require('mongoose');

const schema = {
  id: Number,
  category: String,
  price: String,
  name: String,
  instock: Boolean
};


const ProductSchema = new mongoose.Schema(schema);

module.exports = mongoose.model("Product", ProductSchema);
