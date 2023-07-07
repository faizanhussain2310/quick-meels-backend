const Meel = require("../models/meel");
const Order = require("../models/order");
const User = require("../models/user");

const mongoose = require("mongoose");

const { validationResult } = require("express-validator");

exports.getMeels = async (req, res, next) => {
  try {
    const meels = await Meel.find();
    res.status(200).json({
      message: "Fetched Meels Successfully",
      meels: meels,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createMeel = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }
  console.log("REQUEST BODY = ", req.body);
  const title = req.body.title;
  const price = +req.body.price;
  const category = req.body.category;
  if (price < 0) {
    const error = new Error("Price cannot be negative");
    next(error);
    return;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    next(error);
    return;
  }
  const meel = new Meel({
    restaurant: user.restaurant,
    userId: user._id,
    title: title,
    price: price,
    category: category,
  });
  try {
    await meel.save();
    res.status(200).json({
      message: "Meel Created Successfully",
      meel: meel,
      restaurant: user.restaurant,
    });
  } catch (err) {
    if (!err.statusCode) {
      statusCode = 500;
    }
    next(err);
  }
};

exports.removeMeel = async (req, res, next) => {
  const dishId = req.params.dishId;
  // console.log("DISHID = ", dishId);
  try {
    const meel = await Meel.findOne({ userId: req.userId, _id: dishId });
    if (!meel) {
      const error = new Error("Dish Not Found");
      error.statusCode = 404;
      throw error;
    }
    console.log("EVENT DELETED = ", meel);
    await Meel.findByIdAndRemove(meel._id);
    const user = await User.findById(req.userId);
    const cart = user.cart;
    const new_cart = cart.filter((item) => item.itemId.toString() !== dishId);
    user.cart = new_cart;
    console.log("NEW CART = ", new_cart);
    await user.save();
    res
      .status(200)
      .json({ message: "Dish Is Deleted Successfully", dishId: meel._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSingleMeel = async (req, res, next) => {
  const dishId = req.params.dishId;
  try {
    const meel = await Meel.findOne({ userId: req.userId, _id: dishId });
    if (!meel) {
      const error = new Error("Dish Not Found");
      error.statusCode = 404;
      throw error;
    }
    console.log("EVENT UPDATED = ", meel);
    res.status(200).json({ message: "Dish Found Successfully", meel: meel });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postSingleMeel = async (req, res, next) => {
  const dishId = req.params.dishId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }
  // console.log("REQUEST BODY = ", req.body);
  const title = req.body.title;
  const price = +req.body.price;
  const category = req.body.category;
  if (price < 0) {
    const error = new Error("Price cannot be negative");
    next(error);
    return;
  }
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      next(error);
      return;
    }
    const meel = await Meel.findOne({ userId: req.userId, _id: dishId });
    meel.title = title;
    meel.price = price;
    meel.category = category;
    await meel.save();
    res.status(200).json({ message: "Meels Updated Successfully", meel: meel });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getMyMeels = async (req, res, next) => {
  // console.log("USERID = ", req.userId);
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      next(error);
      return;
    }
    const meels = await Meel.find({ userId: req.userId });
    res.status(200).json({
      message: "Fetched Meels Successfully",
      meels: meels,
      restaurant: user.restaurant,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    console.log("DATA = ", error.data);
    next(error);
    return;
  }
  const address = req.body.address;
  const city = req.body.city;
  const landmark = req.body.landmark;
  const pincode = req.body.pincode;
  const items = req.body.items;
  const totalAmount = req.body.totalAmount;
  if (pincode.length !== 6) {
    const error = new Error("Pincode should be 6 character long");
    next(error);
    return;
  }
  let checker = true;
  for (let char of pincode) {
    if (char >= "0" && char <= "9") {
    } else {
      checker = false;
    }
  }
  console.log("CHECKER = ", checker);
  if (!checker) {
    const error = new Error("Please enter a valid pincode");
    next(error);
    return;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    next(error);
    return;
  }
  const new_items = items.map((item) => {
    return {
      quantity: item.amount,
      item: {
        _id: new mongoose.Types.ObjectId(item.id),
        title: item.name,
        price: item.price,
        category: item.category,
        restaurant: item.restaurant,
      },
    };
  });
  console.log("NEW_ITEM = ", new_items);
  const order = new Order({
    userId: req.userId,
    address: {
      address: address,
      landmark: landmark,
      city: city,
      pincode: pincode,
    },
    items: new_items,
    totalAmount: totalAmount,
  });
  try {
    await order.save();
    user.cart = [];
    await user.save();
    res
      .status(200)
      .json({ message: "Order Created Successfully", orderId: order._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res
      .status(200)
      .json({ message: "Fetched Orders Successfully", orders: orders });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    next(error);
    return;
  }
  const productId = req.body.id;
  console.log("ITEM = ", req.body);
  const cart = user.cart;
  const cartIndex = cart.findIndex(
    (item) => item.itemId.toString() === productId
  );
  const cartItem = cart[cartIndex];
  if (cartItem) {
    cartItem.quantity++;
    cart[cartIndex] = cartItem;
  } else {
    cart.push({ itemId: new mongoose.Types.ObjectId(productId), quantity: 1 });
  }
  user.cart = cart;
  try {
    await user.save();
    res.status(200).json({ message: "Cart Updated", cart: user.cart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteFromCart = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    next(error);
    return;
  }
  const productId = req.body.id;
  console.log("ITEM = ", req.body);
  let cart = user.cart;
  const cartIndex = cart.findIndex(
    (item) => item.itemId.toString() === productId
  );
  const cartItem = cart[cartIndex];
  if (cartItem.quantity > 1) {
    cartItem.quantity--;
    cart[cartIndex] = cartItem;
  } else {
    const tempCart = cart.filter(
      (item) => item.itemId.toString() !== productId
    );
    cart = tempCart;
  }
  user.cart = cart;
  try {
    await user.save();
    res.status(200).json({ message: "Cart Updated", cart: user.cart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    next(error);
    return;
  }
  user.cart = [];
  try {
    await user.save();
    res.status(200).json({
      message: "Cart Emptied Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    next(error);
    return;
  }
  let cart = [];
  let totalAmount = 0;
  if (user.cart.length > 0) {
    for (let item of user.cart) {
      const product = await Meel.findById(item.itemId);
      if (product) {
        cart.push({
          id: product._id.toString(),
          amount: item.quantity,
          name: product.title,
          price: product.price,
          category: product.category,
          restaurant: product.restaurant,
        });
        totalAmount += item.quantity * product.price;
      }
    }
  }
  res.status(200).json({
    message: "Cart Send Successfully",
    items: cart,
    totalAmount: totalAmount,
  });
};
