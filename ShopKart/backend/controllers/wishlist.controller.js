import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";

const addProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (!req.user.wishlist) {
            req.user.wishlist = [];
        }

        const isWished = req.user.wishlist.some((id) => id.toString() === productId);
        if (isWished) {
            return res.status(409).json({ error: "Product is already wishlisted" });
        }

        req.user.wishlist.push(productId);
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const user = req.user
        const userId = user._id
        const customer = await Customer.findById(userId).populate({
            path: "wishlist",
            select: "name price category image stock"
        });
        const wishlist = customer ? customer.wishlist : [];

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist
        })
    }
    catch (err) {
        return res.status(500).json({ error: "Internal Server error occured" })
    }
}
const removeProduct = async (req, res) => {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" });
        }
        const wishlist = req.user.wishlist;
        const isPresent = wishlist.some((id) => id.toString() === productId)
        if (!isPresent) {
            return res.status(404).json({ error: "No such product is wishlisted" });
        }
        req.user.wishlist = req.user.wishlist.filter(
            (id) => id.toString() !== productId
        );

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        })
    } catch (err) {
        return res.status(500).json({ error: "Internal server error occurred" });
    }
}

const toggleProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (!req.user.wishlist) {
            req.user.wishlist = [];
        }

        const isSaved = req.user.wishlist.some((id) => id.toString() === productId);

        if (isSaved) {
            req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== productId);
            await req.user.save();

            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        } else {
            req.user.wishlist.push(productId);
            await req.user.save();

            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        }
    } catch (err) {
        return res.status(500).json({ error: "Internal server error occurred" });
    }
};

export { addProduct, getProduct, removeProduct, toggleProduct };

