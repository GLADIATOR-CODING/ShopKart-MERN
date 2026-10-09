import mongoose from "mongoose"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"
import Order from "../models/order.model.js"
import razorpay from "../config/razorpay.js"
import crypto from "crypto"

const createOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
            return res.status(400).json({ success: false, message: "Invalid shipping data" });
        }

        const userId = req.user._id;

        const user = await Customer.findById(userId).populate('cart.product');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cart = user.cart;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart) {
            const product = await Product.findById(item.product._id);

            if (!product) {
                return res.status(400).json({ success: false, message: "Product not found" });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
            }

            totalAmount += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image
            });
        }

        const shopKartOrder = new Order({
            user: userId,
            items: orderItems,
            shippingAddress,
            totalAmount,
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING"
        });
        await shopKartOrder.save();

        const amountInRupees = totalAmount;
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amountInRupees * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString()
        });

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(200).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.error("Error creating order:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;

        await order.save();

        const user = await Customer.findById(req.user._id);
        if (user) {
            user.cart = [];
            await user.save();
        }

        return res.status(200).json({ success: true, message: "Order placed successfully", order });

    } catch (err) {
        console.error("Error verifying payment:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

const showOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

const singleOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        return res.status(200).json({ success: true, order });
    } catch (err) {
        console.error("Error fetching single order:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export { createOrder, verifyPayment, showOrder, singleOrder }