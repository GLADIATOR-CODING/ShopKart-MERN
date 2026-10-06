import express from "express"
import { loginUser, logoutUser, registerUser, showCustomer, changePassword } from "../controllers/customer.controller.js"
import authMiddleWare from "../middlewares/auth.middleware.js";

const router = express.Router()
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', authMiddleWare, logoutUser)
router.get('/me', authMiddleWare, showCustomer)
router.patch('/change-password', authMiddleWare, changePassword)

export default router