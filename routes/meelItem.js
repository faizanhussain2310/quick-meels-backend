const express = require("express");
const { body } = require("express-validator");

// const feedController = require('../controllers/feed');
const isAuth = require("../middleware/is-auth");

const meelController = require("../controllers/meelItem");

const router = express.Router();

router.get("/meels", meelController.getMeels);

router.post(
  "/meels",
  [
    body("title")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name of dish cannot be empty"),
  ],
  isAuth,
  meelController.createMeel
);

router.post("/my-meels/delete/:dishId", isAuth, meelController.removeMeel);

router.get("/my-meels/edit/:dishId", isAuth, meelController.getSingleMeel);

router.post(
  "/my-meels/edit/:dishId",
  [
    body("title")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name of dish cannot be empty"),
  ],
  isAuth,
  meelController.postSingleMeel
);

router.get("/my-meels", isAuth, meelController.getMyMeels);

router.get("/orders", isAuth, meelController.getOrders);

router.post(
  "/orders",
  [
    body("address").not().isEmpty().withMessage("Address cannot be empty"),
    body("landmark").not().isEmpty().withMessage("Landmark cannot be empty"),
    body("city").not().isEmpty().withMessage("City cannot be empty"),
  ],
  isAuth,
  meelController.postOrder
);

router.post("/add-to-cart", isAuth, meelController.addToCart);

router.post("/delete-from-cart", isAuth, meelController.deleteFromCart);

router.get("/get-cart", isAuth, meelController.getCart);

router.post("/clear-cart", isAuth, meelController.clearCart);

module.exports = router;
