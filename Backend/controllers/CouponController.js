// const CouponModel = require("../models/CouponModel");


// // Admin creates a coupon
// const createCoupon = async (req, res) => {
//   try {
//     const { code, discountType, discountValue, minOrderAmount, expiryDate } = req.body;
//     const coupon = new CouponModel({ code, discountType, discountValue, minOrderAmount, expiryDate });
//     await coupon.save();
//     res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // User validates coupon before checkout
// // User validates coupon before checkout
// const validateCoupon = async (req, res) => {
//   try {
//     const { code, orderAmount } = req.body;

//     const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim(), isActive: true });

//     if (!coupon) 
//       return res.status(404).json({ success: false, message: "Invalid coupon" });

//     if (new Date(coupon.expiryDate) < new Date())
//       return res.status(400).json({ success: false, message: "Coupon expired" });

//     if (orderAmount < coupon.minOrderAmount)
//       return res.status(400).json({ 
//         success: false, 
//         message: `Minimum order ₹${coupon.minOrderAmount} required` 
//       });

//     // calculate discount
//     let discount = 0;
//     if (coupon.discountType === "percent") {
//       discount = (orderAmount * coupon.discountValue) / 100;
//     } else {
//       discount = coupon.discountValue;
//     }

//     const finalAmount = Math.max(orderAmount - discount, 0);

//     res.status(200).json({ 
//       success: true, 
//       discount, 
//       finalAmount,
//        coupon 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// module.exports = { createCoupon, validateCoupon };
const CouponModel = require("../models/CouponModel");

// Admin creates a coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, maxDiscount } = req.body;

    // Validate input
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Code, discount type, discount value, and expiry date are required" 
      });
    }

    // Check if coupon already exists
    const existingCoupon = await CouponModel.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({ 
        success: false, 
        message: "Coupon code already exists" 
      });
    }

    const coupon = new CouponModel({
      code,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      expiryDate,
      maxDiscount: maxDiscount || null
    });

    await coupon.save();
    res.status(201).json({ 
      success: true, 
      message: "Coupon created successfully", 
      coupon 
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User validates coupon before checkout
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "Coupon code and order amount are required" 
      });
    }

    const coupon = await CouponModel.findOne({ 
      code: code.toUpperCase().trim(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (orderAmount * coupon.discountValue) / 100;
      
      // Cap discount if maxDiscount is set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    const finalAmount = Math.max(orderAmount - discount, 0);

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discount,
      finalAmount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        // Send these for backend order processing
        type: coupon.discountType, // Add this for backend compatibility
        discount: discount // Send calculated discount amount
      }
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all available coupons (FIXED)
const getCoupons = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const coupons = await CouponModel.find({
      isActive: true,
      expiryDate: { $gte: currentDate } // Only get non-expired coupons
    }).select("code discountType discountValue minOrderAmount expiryDate maxDiscount")
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log("Fetching coupons...");
    console.log("Current date:", currentDate);
    console.log("Found coupons:", coupons.length);
    console.log("Coupon details:", coupons);

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
      message: coupons.length > 0 ? "Coupons fetched successfully" : "No active coupons found"
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single coupon details (bonus function)
const getCouponDetails = async (req, res) => {
  try {
    const { code } = req.params;
    
    const coupon = await CouponModel.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: "Coupon not found or expired" 
      });
    }

    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error("Get coupon details error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  createCoupon, 
  validateCoupon, 
  getCoupons, 
  getCouponDetails 
};