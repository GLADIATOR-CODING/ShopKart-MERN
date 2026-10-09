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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, ".env") })

const app = express()

app.use(cors({
    origin: true,
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 2
}).then(() => {
    console.log("successfully connected to MongoDB")
}).catch((err) => { console.log("Database connection error:", err.message) })

app.use("/customers", customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.listen(process.env.PORT, () => {
    console.log("Success in hosting on port:" + process.env.PORT)
})