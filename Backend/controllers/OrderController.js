
// const OrderModel = require("../models/OrderModel");
// const userModel = require("../models/UserModel");
// const Stripe = require('stripe');
// const Razorpay = require("razorpay");

// // Global variables
// const currency = 'inr';
// const deliveryCharges = 10;

// // Gateway initialize
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Helper: calculate subtotal from items
// const calculateSubtotal = (items) => {
//     return items.reduce((sum, item) => {
//         return sum + (item.price * item.quantity);
//     }, 0);
// };

// // Helper: calculate final amount after coupon
// const calculateFinalAmount = (items, coupon) => {
//     let finalAmount = calculateSubtotal(items);

//     if (coupon && coupon.discount) {
//         if (coupon.type === 'percentage') {
//             finalAmount = finalAmount - (finalAmount * coupon.discount / 100);
//         } else {
//             finalAmount = finalAmount - coupon.discount;
//         }
//     }

//     finalAmount += deliveryCharges; // add delivery
//     return finalAmount < 0 ? 0 : finalAmount;
// };

// // Place order using COD
// const placeOrder = async (req, res) => {
//     try {
//         const { userId, items, address, coupon } = req.body;
//         const finalAmount = calculateFinalAmount(items, coupon);

//         const orderData = {
//             userId,
//             items,
//             address,
//             amount: finalAmount,
//             paymentMethod: "COD",
//             payment: false,
//             date: Date.now(),
//             coupon: coupon || null
//         };

//         const newOrder = new OrderModel(orderData);
//         await newOrder.save();
//         await userModel.findByIdAndUpdate(userId, { cartData: {} });

//         res.json({ success: true, message: "Order Placed", order: newOrder });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Place order using Stripe
// const placeOrderStripe = async (req, res) => {
//     try {
//         const { userId, items, address, coupon } = req.body;
//         const { origin } = req.headers;

//         const finalAmount = calculateFinalAmount(items, coupon);

//         // Save order in DB
//         const orderData = {
//             userId,
//             items,
//             address,
//             amount: finalAmount,
//             paymentMethod: "Stripe",
//             payment: false,
//             date: Date.now(),
//             coupon: coupon || null
//         };

//         const newOrder = new OrderModel(orderData);
//         await newOrder.save();

//         // Stripe: single line item with final amount
//         const line_items = [
//             {
//                 price_data: {
//                     currency: currency,
//                     product_data: { name: 'Order Total' },
//                     unit_amount: Math.round(finalAmount * 100) // in paise
//                 },
//                 quantity: 1
//             }
//         ];

//         const session = await stripe.checkout.sessions.create({
//             success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
//             line_items,
//             mode: 'payment',
//         });

//         res.json({ success: true, session_url: session.url });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Verify Stripe payment
// const verifyStripe = async (req, res) => {
//     const { orderId, success, userId } = req.body;
//     try {
//         if (success === 'true') {
//             await OrderModel.findByIdAndUpdate(orderId, { payment: true });
//             await userModel.findByIdAndUpdate(userId, { cartData: {} });
//             res.json({ success: true });
//         } else {
//             await OrderModel.findByIdAndDelete(orderId);
//             res.json({ success: false });
//         }
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Place order using Razorpay
// const placeOrderRazorpay = async (req, res) => {
//     try {
//         const { userId, items, address, coupon } = req.body;
//         const finalAmount = calculateFinalAmount(items, coupon);

//         const orderData = {
//             userId,
//             items,
//             address,
//             amount: finalAmount,
//             paymentMethod: "Razorpay",
//             payment: false,
//             date: Date.now(),
//             coupon: coupon || null
//         };

//         const newOrder = new OrderModel(orderData);
//         await newOrder.save();

//         const options = {
//             amount: Math.round(finalAmount * 100), // in paise
//             currency: currency.toUpperCase(),
//             receipt: newOrder._id.toString()
//         };

//         const razorpayOrder = await razorpayInstance.orders.create(options);
//         res.json({ success: true, order: razorpayOrder });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Verify Razorpay payment
// const verifyRazorpay = async (req, res) => {
//     try {
//         const { userId, razorpay_order_id } = req.body;

//         const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
//         if (orderInfo.status === 'paid') {
//             await OrderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
//             await userModel.findByIdAndUpdate(userId, { cartData: {} });
//             res.json({ success: true, message: "Payment Successful" });
//         } else {
//             res.json({ success: false, message: "Payment Failed" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Admin: all orders
// const allOrders = async (req, res) => {
//     try {
//         const orders = await OrderModel.find({});
//         res.status(200).json({ success: true, orders });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // User orders
// const UserOrders = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const orders = await OrderModel.find({ userId });
//         res.status(200).json({ success: true, orders });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Update order status
// const updateStatus = async (req, res) => {
//     try {
//         const { orderId, status } = req.body;
//         await OrderModel.findByIdAndUpdate(orderId, { status });
//         res.status(200).json({ success: true, message: "Order status updated successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// module.exports = {
//     placeOrder,
//     placeOrderStripe,
//     placeOrderRazorpay,
//     allOrders,
//     UserOrders,
//     updateStatus,
//     verifyStripe,
//     verifyRazorpay
// };



const OrderModel = require("../models/OrderModel");
const userModel = require("../models/UserModel");
const Stripe = require('stripe');
const Razorpay = require("razorpay");

// Global variables
const currency = 'inr';
const deliveryCharges = 10;

// Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper: calculate subtotal from items
const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
};

// Helper: calculate final amount after coupon
const calculateFinalAmount = (items, coupon) => {
    const subtotal = calculateSubtotal(items);
    let finalAmount = subtotal;

    // Add detailed logging to see what's happening
    console.log("=== DISCOUNT CALCULATION DEBUG ===");
    console.log("Items:", items);
    console.log("Subtotal:", subtotal);
    console.log("Coupon received:", coupon);
    console.log("Delivery charges:", deliveryCharges);

    // FIX: Handle both coupon formats
    if (coupon && (coupon.discountValue || coupon.discount)) {
        const discountType = coupon.discountType || coupon.type;
        const discountValue = coupon.discountValue || coupon.discount;
        
        console.log("Discount type:", discountType);
        console.log("Discount value:", discountValue);
        
        if (discountType === 'percent') {
            const discountAmount = finalAmount * discountValue / 100;
            finalAmount = finalAmount - discountAmount;
            console.log("Percent discount applied:", discountAmount);
        } else if (discountType === 'flat') {
            finalAmount = finalAmount - discountValue;
            console.log("Flat discount applied:", discountValue);
        }
    } else {
        console.log("No valid coupon found or missing discount fields");
    }

    finalAmount += deliveryCharges; // add delivery
    finalAmount = finalAmount < 0 ? 0 : finalAmount;
    
    console.log("Final amount after discount and delivery:", finalAmount);
    console.log("=== END DEBUG ===");
    
    return finalAmount;
};

// Place order using COD
const placeOrder = async (req, res) => {
    try {
        const { userId, items, address, coupon } = req.body;
        const finalAmount = calculateFinalAmount(items, coupon);

        const orderData = {
            userId,
            items,
            address,
            amount: finalAmount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
            coupon: coupon || null
        };

        const newOrder = new OrderModel(orderData);
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed", order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place order using Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address, coupon } = req.body;
        const { origin } = req.headers;

        const finalAmount = calculateFinalAmount(items, coupon);

        // Save order in DB
        const orderData = {
            userId,
            items,
            address,
            amount: finalAmount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
            coupon: coupon || null
        };

        const newOrder = new OrderModel(orderData);
        await newOrder.save();

        // SIMPLE FIX: Use the discounted finalAmount directly
        const line_items = [
            {
                price_data: {
                    currency: currency,
                    product_data: { name: 'Order Total (After Discount)' },
                    unit_amount: Math.round(finalAmount * 100) // This is already the discounted amount
                },
                quantity: 1
            }
        ];

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};



// Verify Stripe payment
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === 'true') {
            await OrderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            await OrderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment cancelled" });
        }
    } catch (error) {
        console.error("Stripe verification error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place order using Razorpay
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, address, coupon } = req.body;
        
        // Validate input
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid order data" });
        }

        const finalAmount = calculateFinalAmount(items, coupon);

        const orderData = {
            userId,
            items,
            address,
            amount: finalAmount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now(),
            coupon: coupon || null
        };

        const newOrder = new OrderModel(orderData);
        await newOrder.save();

        const options = {
            amount: Math.round(finalAmount * 100), // Convert to paise
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
            notes: {
                orderId: newOrder._id.toString(),
                userId: userId,
                couponCode: coupon?.code || 'none'
            }
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        
        res.json({ 
            success: true, 
            order: razorpayOrder
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Razorpay payment
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature for security
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        
        if (orderInfo.status === 'paid') {
            await OrderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: "Payment Failed" });
        }
    } catch (error) {
        console.error("Razorpay verification error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: all orders
const allOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({}).sort({ date: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Fetch orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// User orders
const UserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const orders = await OrderModel.find({ userId }).sort({ date: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Fetch user orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required" });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    UserOrders,
    updateStatus,
    verifyStripe,
    verifyRazorpay
};