import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addToCart, getUserCart, removeFromCart } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.get("/get", authMiddleware, getUserCart);
cartRouter.get("/remove", authMiddleware, removeFromCart);
export default cartRouter;
