const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const meelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  restaurant: {
    type: String,
    required: true,
  },
  cart: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("User", meelSchema);
