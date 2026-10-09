import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Only load dotenv locally, not on Vercel production
if (process.env.NODE_ENV !== "production") {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        dotenv.config({ path: path.resolve(__dirname, "../.env") });
    } catch (err) {
        console.log("Could not load .env file:", err.message);
    }
}

let razorpay = null;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "missing_key_id",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "missing_key_secret"
    });
} catch (err) {
    console.log("Razorpay initialization error:", err.message);
}

export default razorpay;
