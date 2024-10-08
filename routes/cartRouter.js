import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addToCart } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post("/add", authMiddleware, addToCart);
export default cartRouter;
