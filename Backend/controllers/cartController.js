const userModel = require("../models/UserModel");
const CouponModel = require("../models/CouponModel");
//add products to cart
const addToCart = async (req,res) => {
    try {
        
        const { userId, itemId, size } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
const applyCoupon = async(req,res)=>{
    try {
        const { code, discount, expiryDate } = req.body;
        const coupon = new CouponModel({ code, discount, expiryDate });
        await coupon.save();
        res.status(201).json({ success: true, message: 'Coupon created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}
const validateCoupon = async (req, res) => {
    try {
        const { code, userId } = req.body;

        const coupon = await CouponModel.findOne({ code, isActive: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        // fetch user cart to calculate discounted total
        const userData = await userModel.findById(userId);
        const cartData = userData.cartData;

        let cartTotal = 0;
        for (const itemId in cartData) {
            for (const size in cartData[itemId]) {
                const quantity = cartData[itemId][size];
                // Assuming you have a way to get item price from itemId
                const price = 100; // replace with actual price lookup
                cartTotal += price * quantity;
            }
        }

        const discountedTotal = cartTotal - coupon.discount;
        const finalTotal = discountedTotal < 0 ? 0 : discountedTotal;

        res.status(200).json({ 
            success: true, 
            discount: coupon.discount, 
            discountedTotal: finalTotal 
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};





module.exports = {addToCart,getUserCart,updateCart,applyCoupon,validateCoupon}