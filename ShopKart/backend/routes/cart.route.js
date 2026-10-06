import express from "express"
import { addCart, showCart, updateCart, removeCart } from "../controllers/cart.controller.js"
import authMiddleWare from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post('/:id', authMiddleWare, addCart)
router.get('/', authMiddleWare, showCart)
router.patch('/:id', authMiddleWare, updateCart)
router.delete('/:id', authMiddleWare, removeCart)

export default router