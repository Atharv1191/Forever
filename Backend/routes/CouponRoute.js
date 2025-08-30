// routes/couponRoutes.js
const express = require("express");
const { createCoupon, validateCoupon } = require("../controllers/CouponController");
const authUser = require("../middlewere/Auth");
const adminAuth = require("../middlewere/adminAuth");

const router = express.Router();

router.post("/create", adminAuth, createCoupon); // only admin
router.post("/validate",authUser, validateCoupon); // user applies coupon

module.exports = router;
