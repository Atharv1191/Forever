// routes/cartRoutes.js
const express = require("express");
const { addToCart, getUserCart, updateCart } = require("../controllers/cartController");
const authUser = require("../middlewere/Auth");

const router = express.Router();

router.post("/get", authUser, getUserCart);
router.post("/add", authUser, addToCart);
router.post("/update", authUser, updateCart);

module.exports = router;
