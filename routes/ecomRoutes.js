import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/userController.js";
import {authMiddleware} from '../middlewares/authMiddleware.js'

const ecomRouter = express.Router();

ecomRouter.post("/user/register", registerUser);
ecomRouter.post("/user/login", loginUser);
ecomRouter.post("/user/logout", logoutUser);
ecomRouter.get("/user/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default ecomRouter;
