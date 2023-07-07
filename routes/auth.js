const express = require("express");
const { body } = require("express-validator");

// const feedController = require('../controllers/feed');
// const isAuth = require('../middleware/is-auth');

const User = require("../models/user");

const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password should be greater than 5 characters"),
    body("name").trim().not().isEmpty().withMessage("Name should not be empty"),
    body("restaurant")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Restaurant should not be empty"),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;
