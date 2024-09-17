const express = require("express");
const {placeOrder,placeOrderStripe,placeOrderRazorpay,allOrders,UserOrders,updateStatus, verifyStripe, verifyRazorpay} = require("../controllers/OrderController");
const adminAuth = require("../middlewere/adminAuth");
const authUser = require("../middlewere/Auth")
const router = express.Router();

router.post('/list',adminAuth,allOrders)
router.post('/status',adminAuth,updateStatus)

//Payment Features
router.post('/place',authUser,placeOrder)
router.post('/stripe',authUser,placeOrderStripe)
router.post('/razorpay',authUser,placeOrderRazorpay)

//User feature
router.post('/userorders',authUser,UserOrders)

//verify payment
router.post('/verifyStripe',authUser,verifyStripe)
router.post('/verifyRazorpay',authUser,verifyRazorpay)
module.exports = router