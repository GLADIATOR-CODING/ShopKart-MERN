import express from "express"
import { addProduct, getProduct, removeProduct, toggleProduct } from "../controllers/wishlist.controller.js"
import authMiddleWare from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post('/:productId', authMiddleWare, addProduct)
router.get('/', authMiddleWare, getProduct)
router.delete('/:productId', authMiddleWare, removeProduct)
router.patch('/:productId/toggle', authMiddleWare, toggleProduct)

export default router