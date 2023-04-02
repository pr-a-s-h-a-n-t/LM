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
    type: String,
    require: true,
    unique: true,
  },
  category: {
    type: String,
    require: true,
  },
  user: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("books", bookSchema);
