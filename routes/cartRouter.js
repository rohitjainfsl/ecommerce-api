import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addToCart, getUserCart } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.get("/get", authMiddleware, getUserCart);
export default cartRouter;
