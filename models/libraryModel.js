const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const librarySchema = new Schema({
  books: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("books", librarySchema);
