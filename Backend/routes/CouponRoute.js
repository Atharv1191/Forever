// routes/couponRoutes.js
const express = require("express");
const { createCoupon, validateCoupon, getCoupons, getCouponDetails } = require("../controllers/CouponController");
const authUser = require("../middlewere/Auth");
const adminAuth = require("../middlewere/adminAuth");

const router = express.Router();

// Only admin can create
router.post("/create", adminAuth, createCoupon);

// User applies coupon
router.post("/validate", authUser, validateCoupon);

// 🆕 User can view all available coupons
router.get("/list",authUser, getCoupons);
router.get('/coupon-details/:code',authUser,  getCouponDetails);
module.exports = router;
