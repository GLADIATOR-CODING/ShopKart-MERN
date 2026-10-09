import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import customerRoutes from "./routes/customer.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import productRoutes from './routes/product.route.js'
import wishlistRoutes from './routes/wishlist.route.js'
import cartRoutes from "./routes/cart.route.js"
import orderRoutes from "./routes/order.route.js"

// Only load dotenv locally, not on Vercel production where env vars are injected
if (process.env.NODE_ENV !== "production") {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        dotenv.config({ path: path.resolve(__dirname, ".env") });
    } catch (err) {
        console.log("Could not load .env file:", err.message);
    }
}

const app = express()

app.get("/", (req, res) => {
    const uri = process.env.MONGODB_URI || "";
    res.status(200).json({ 
        status: "success", 
        message: "ShopKart Backend API is running!",
        dbConfigured: !!uri,
        dbPrefix: uri.substring(0, 15)
    });
});

app.use(cors({
    origin: true,
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return null;
    }
    try {
        let uri = process.env.MONGODB_URI || "";
        uri = uri.replace(/^["']|["']$/g, ""); // Strip accidental quotes
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            minPoolSize: 2,
            bufferCommands: false // Fail fast if not connected
        });
        console.log("successfully connected to MongoDB");
        return null;
    } catch (err) {
        return err.message;
    }
};

// Ensure DB connects before handling any request in serverless
app.use(async (req, res, next) => {
    const dbError = await connectDB();
    if (dbError) {
        return res.status(500).json({ error: "Failed to connect to database", details: dbError });
    }
    next();
});

app.use("/customers", customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Export app for Vercel serverless
export default app;

// Only start the HTTP server when running locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
    app.listen(process.env.PORT || 8000, () => {
        console.log("Success in hosting on port:" + (process.env.PORT || 8000))
    })
}