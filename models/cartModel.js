import { Schema, model } from "mongoose";

// const cartSchema = new Schema(
//   {
//     products: [
//       {
//         product: {
//           type: Schema.Types.ObjectId,
//           ref: "Product",
//         },
//         count: Number,
//         color: String,
//         price: Number,
//       },
//     ],
//     cartTotal: Number,
//     orderby: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const cartModel = model("Cart", cartSchema);

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  attributes: {
    type: Map,
    of: String,
  },
});

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartModel = model("Cart", cartSchema);

export default cartModel;
