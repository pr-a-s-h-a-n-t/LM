const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    username: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    phone: {
      type: Number,
      require: true,
    },
    emailAuthenticated: {
      type: Boolean,
      require: true,
      default: false,
    },
    resetPassword: {
      type: Boolean,
      // require: false,
      default: false,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("user", userSchema);
