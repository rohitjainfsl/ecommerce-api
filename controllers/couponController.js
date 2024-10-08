import couponModel from "../models/couponModel.js";

export async function createCoupon(req, res) {
  try {
    const {
      code,
      discount,
      expiryDate,
      isActive,
      applicableProducts,
      minimumPurchaseAmount,
      usageLimit,
      usedCount,
    } = req.body;

    // Convert code to uppercase
    const upperCaseCode = code.toUpperCase();

    // Check if a coupon with the same code already exists
    const existingCoupon = await couponModel.findOne({ code: upperCaseCode });

    if (existingCoupon) {
      res.status(400).json({ error: "A coupon with this code already exists" });
    }

    const coupon = new couponModel({
      code: upperCaseCode,
      discount,
      expiryDate,
      isActive,
      applicableProducts,
      minimumPurchaseAmount,
      usageLimit,
      usedCount,
    });
    const createdCoupon = await coupon.save();

    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function listCoupons(req, res) {
  const coupons = await couponModel.find({}).sort({ createdAt: -1 });
  res.json(coupons);
}
