import cartModel from "../models/cartModel.js";
import { productModel } from "../models/productModel.js";
import { userModel } from "../models/userModel.js";

export async function addToCart(req, res) {
  const { cart } = req.body;
  const userID = req.user._id;
  try {
    let products = [];
    const user = await userModel.findById(userID);

    // check if user already have product in cart
    const alreadyExistCart = await cartModel.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await productModel
        .findById(cart[i]._id)
        .select("price")
        .exec();
      object.price = getPrice.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new cartModel({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// function postUserData(e){
//     setUserData({...userData, [e.target.name] : e.target.value})
// }