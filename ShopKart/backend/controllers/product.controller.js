import Product from "../models/product.model.js";
import mongoose from "mongoose"

const createProduct = async (req, res) => {

    try {
        const { name, description, price, category, image, stock } = req.body

        if (!name || !description || !category || !image || price === undefined || price === null ||
            stock === undefined || stock === null) {
            return res.status(400).json({ message: "Missing required field" })
        }

        if (typeof price !== "number" || isNaN(price) || price <= 0) {
            return res.status(400).json({ error: "Invalid price" });
        }

        if (typeof stock !== "number" || isNaN(stock) || stock < 0) {
            return res.status(400).json({ error: "Invalid stock" });
        }


        const newProduct = await Product.create({
            name, description, price, category, image, stock
        })

        res.status(201).json(newProduct)
    }
    catch (err) {
        res.status(500).json({ error: 'Internal error occured' })
    }
}


const showProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const query = {}
        if (search && search.trim() !== "") {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        if (category) {
            query.category = category
        }
        const products = await Product.find(query).select("name price category image stock");
        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        console.error("Error in showProducts:", err);
        return res.status(500).json({ error: "Internal server error occurred", details: err.message });
    }
};

const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid product ID" });
        }
        const singlePro = await Product.findById(id);
        if (!singlePro) {
            return res.status(404).json({ message: "Product not found" })
        }
        return res.status(200).json(singlePro);
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error occurred" });
    }
}


export { createProduct, showProducts, singleProduct }