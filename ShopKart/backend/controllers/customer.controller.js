import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt"
import generateTokenandSetCookie from "../utils/generateToken.js";
import dotenv from "dotenv"
dotenv.config()

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "Missing Fields" })
        }

        const cleanEmail = email.trim().toLowerCase()
        const Emailexisting = await Customer.findOne({ email: cleanEmail })
        if (password.length < 6) {
            return res.status(400).json({ message: "Password too short" })
        }
        if (Emailexisting) {
            return res.status(409).json({ message: "Email already exists" })
        }

        const hashP = await bcrypt.hash(password, 10)
        const newCustomer = await Customer.create({
            fullName,
            email: cleanEmail,
            password: hashP,
            phone
        })
        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: fullName,
                email: cleanEmail,
                phone: phone
            }
        })

    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const cleanEmail = email.trim().toLowerCase()
        const user = await Customer.findOne({ email: cleanEmail })
        if (!user) {
            return res.status(401).json({ message: "Invalid Email or Password" })
        }

        const compare = await bcrypt.compare(password, user.password)
        if (!compare) {
            return res.status(401).json({ message: "Invalid Email or Password" })
        }
        const token = generateTokenandSetCookie(res, user._id)

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            customer: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }
        })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }

}
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        })
        return res.status(200).json({
            sucess: true,
            message: "Logged Out successfully"
        })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const showCustomer = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            customer: req.user
        })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        customer.password = hashedPassword;
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export { registerUser, loginUser, logoutUser, showCustomer, changePassword }