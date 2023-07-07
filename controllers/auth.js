const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    // console.log("ERROR = ", error.data);
    next(error);
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmpassword;
  const name = req.body.name;
  const restaurant = req.body.restaurant;
  try {
    const existingUser = await User.findOne({ email: email });
    console.log("existing = ", existingUser);
    if (existingUser) {
      const error = new Error("User Already Exist");
      error.statusCode = 422;
      throw error;
    }
    if (password !== confirmPassword) {
      const error = new Error("Passwords Are Not Same");
      error.statusCode = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      restaurant: restaurant,
    });
    await user.save();
    res
      .status(200)
      .json({ message: "User Created Successfully", userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User Not Found");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "1hr" }
    );
    res.status(200).json({ token: token, userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
