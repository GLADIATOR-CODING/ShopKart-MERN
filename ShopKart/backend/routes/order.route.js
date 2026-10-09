import express from "express"
import { createOrder, verifyPayment, showOrder, singleOrder } from "../controllers/order.controller.js"
import authMiddleWare from "../middlewares/auth.middleware.js"


const router = express.Router()
router.post('/create-payment-order', authMiddleWare, createOrder);
router.post('/verify-payment', authMiddleWare, verifyPayment)
router.get('/', authMiddleWare, showOrder);
router.get('/:id', authMiddleWare, singleOrder)
export default router 