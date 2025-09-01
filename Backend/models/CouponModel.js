

const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "NEWUSER50"
  
  // discount type: either flat (₹100) or percent (10%)
  discountType: { 
    type: String, 
    enum: ["flat", "percent"], 
    default: "percent" 
  },

  discountValue: { type: Number, required: true }, // e.g. 10% or ₹100
  
  minOrderAmount: { type: Number, default: 0 }, // optional minimum order

  expiryDate: { type: Date, required: true },
  maxDiscount: { type: Number, default: null },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Always save code in uppercase for consistency
couponSchema.pre("save", function (next) {
  this.code = this.code.toUpperCase().trim();
  next();
});

// Index for faster coupon lookups
couponSchema.index({ code: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
