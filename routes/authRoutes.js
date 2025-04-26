import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.get("/me", authMiddleware, (req, res) => {
  // If the middleware didn't throw an error, the user is authenticated
  res.json({ user: req.user });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: false,
    secure: "true",
    sameSite: "none"
  }).json({ message: "Logged out successfully" });
});

export default authRouter;
