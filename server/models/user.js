const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
      trim: true,
      minlength: 1,
    },
    gid: {
      type: Number,
      unique: true,
    },
    picture: {
      type: String,
    },
    email: {
      type: String,
    },
    transcriptions: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
