import jwt from "jsonwebtoken"
import Customer
    from "../models/customer.model.js";

const authMiddleWare = async (req, res, next) => {
    try {
        const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        const decoded = jwt.verify(token, process.env.JWTsecret);
        if (!decoded) {
            return res.status(401).json({ message: "Not authorization" });
        }
        const user = await Customer.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next()
    }
    catch (err) {
        res.status(401).json({ message: "Invalid/expired token" })
    }
}
export default authMiddleWare