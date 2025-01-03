import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createCoupon, listCoupons } from "../controllers/couponController.js";

const couponRouter = Router();

couponRouter.post("/create", authMiddleware, createCoupon);
couponRouter.get("/list", authMiddleware, listCoupons);

export default couponRouter;
