import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.get("/get", authMiddleware, getUserCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.put("/update", authMiddleware, updateCartItem);
export default cartRouter;
