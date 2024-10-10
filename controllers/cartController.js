import cartModel from "../models/cartModel.js";
import { productModel } from "../models/productModel.js";
import { userModel } from "../models/userModel.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, attributes } = req.body;
    const userId = req.user.id; // Assuming you have middleware to extract user ID from JWT

    console.log(userId, "userid");

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.attributes) === JSON.stringify(attributes)
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, attributes });
    }

    cart.updatedAt = new Date();

    await cart.save();

    res.status(200).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart" });
  }
};

// export async function addToCart(req, res) {
//   const { cart } = req.body;
//   const userID = req.user._id;
//   try {
//     let products = [];
//     const user = await userModel.findById(userID);

//     // check if user already have product in cart
//     const alreadyExistCart = await cartModel.findOne({ orderby: user._id });
//     if (alreadyExistCart) {
//       alreadyExistCart.remove();
//     }

//     for (let i = 0; i < cart.length; i++) {
//       let object = {};
//       object.product = cart[i]._id;
//       object.count = cart[i].count;
//       object.color = cart[i].color;
//       let getPrice = await productModel
//         .findById(cart[i]._id)
//         .select("price")
//         .exec();
//       object.price = getPrice.price;
//       products.push(object);
//     }

//     let cartTotal = 0;
//     for (let i = 0; i < products.length; i++) {
//       cartTotal = cartTotal + products[i].price * products[i].count;
//     }

//     let newCart = await new cartModel({
//       products,
//       cartTotal,
//       orderby: user?._id,
//     }).save();
//     res.json(newCart);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

// function postUserData(e){
//     setUserData({...userData, [e.target.name] : e.target.value})
// }
