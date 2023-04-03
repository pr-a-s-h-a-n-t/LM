const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  author: {
    type: String,
    require: true,
    unique: true,
  },
  price: {
    type: Number,
    require: true,
    unique: true,
  },
  category: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
} , {strict: false});

module.exports = mongoose.model("book", bookSchema);
