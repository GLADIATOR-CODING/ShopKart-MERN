import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
const generateTokenandSetCookie = (res, id) => {
    const token = jwt.sign(
        { id },
        process.env.JWTsecret,
        { expiresIn: "7d" }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return token
}

export default generateTokenandSetCookie;