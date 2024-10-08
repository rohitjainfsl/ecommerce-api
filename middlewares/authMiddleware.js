import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import "dotenv/config";

export const authMiddleware = async (req, res, next) => {
  try {
    // Check if the token exists in the request headers
    const token =
      req.cookies.auth_token ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.body.tempToken;

    if (!token) {
      //No authentication token, access denied
      return res.status(200).json(null);
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Find the user by id
    const user = await userModel.findById(decoded.userID).select("-password");

    if (!user) {
      //USER NOT FOUND
      return res.status(200).json(null);
    }

    // Attach the user to the request object
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
