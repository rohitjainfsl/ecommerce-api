import express from "express";
import {
  createProduct,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
  addToWishlist,
  rating,
  getOptions,
  getProductCategories,
  getBrandsInCategory,
} from "../controllers/productController.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const productRouter = express.Router();

// productRouter.post("/", authMiddleware, upload.single("url"), createProduct);
productRouter.post("/", upload.single("url"), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getSingleProduct);
productRouter.delete("/:id", deleteProduct);
productRouter.post("/addToWishlist/:productID", authMiddleware, addToWishlist);
productRouter.post("/rating", authMiddleware, rating);
productRouter.get("/get", getOptions);

productRouter.get("/categories/all", getProductCategories);
productRouter.get("/brands/:category", getBrandsInCategory);

export default productRouter;
