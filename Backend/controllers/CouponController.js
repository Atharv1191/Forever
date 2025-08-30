const CouponModel = require("../models/CouponModel");


// Admin creates a coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate } = req.body;
    const coupon = new CouponModel({ code, discountType, discountValue, minOrderAmount, expiryDate });
    await coupon.save();
    res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User validates coupon before checkout
// User validates coupon before checkout
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim(), isActive: true });

    if (!coupon) 
      return res.status(404).json({ success: false, message: "Invalid coupon" });

    if (new Date(coupon.expiryDate) < new Date())
      return res.status(400).json({ success: false, message: "Coupon expired" });

    if (orderAmount < coupon.minOrderAmount)
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order ₹${coupon.minOrderAmount} required` 
      });

    // calculate discount
    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = Math.max(orderAmount - discount, 0);

    res.status(200).json({ 
      success: true, 
      discount, 
      finalAmount,
       coupon 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { createCoupon, validateCoupon };