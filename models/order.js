const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const meelSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  items: [
    {
      item: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  address: {
    address: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Order", meelSchema);
