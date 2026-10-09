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

// Add a root route for health check
app.get("/", (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "ShopKart Backend API is running!",
        dbConfigured: !!process.env.MONGODB_URI 
    });
});

app.use(cors({
    origin: true,
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())

try {
    mongoose.connect(process.env.MONGODB_URI || "", {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 2
    }).then(() => {
        console.log("successfully connected to MongoDB")
    }).catch((err) => { console.log("Database connection error:", err.message) })
} catch (err) {
    console.log("Mongoose connect sync error:", err.message);
}

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