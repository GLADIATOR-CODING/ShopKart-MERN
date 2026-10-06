import mongoose from "mongoose"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"

const addCart = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        if (!req.user.cart) {
            req.user.cart = []
        }

        const cartItem = req.user.cart.find((item) => (item.product?._id || item.product).toString() === id)

        if (cartItem) {
            if (cartItem.quantity + 1 > product.stock) {
                return res.status(400).json({ message: "Not enough stock available" })
            }
            cartItem.quantity += 1
        } else {
            if (product.stock < 1) {
                return res.status(400).json({ message: "Product out of stock" })
            }
            req.user.cart.push({ product: id, quantity: 1 })
        }

        await req.user.save()
        return res.status(200).json({ success: true, message: "Cart updated", cart: req.user.cart })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

const showCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock"
        })

        return res.status(200).json({ success: true, cart: customer.cart })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

const updateCart = async (req, res) => {
    try {
        const { id } = req.params
        const { quantity } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" })
        }

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const cartItem = req.user.cart.find((item) => item.product.toString() === id)
        if (!cartItem) {
            return res.status(404).json({ message: "Product not in cart" })
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: "Quantity exceeds available stock" })
        }

        cartItem.quantity = quantity
        await req.user.save()

        return res.status(200).json({ success: true, message: "Quantity updated", cart: req.user.cart })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

const removeCart = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const cartItem = req.user.cart.find((item) => item.product.toString() === id)
        if (!cartItem) {
            return res.status(404).json({ message: "Product not in cart" })
        }

        req.user.cart = req.user.cart.filter((item) => item.product.toString() !== id)
        await req.user.save()

        return res.status(200).json({ success: true, message: "Product removed from cart", cart: req.user.cart })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export { addCart, showCart, updateCart, removeCart }
