import cartModel from "../models/cartModel.js";
import { productModel } from "../models/productModel.js";
import { userModel } from "../models/userModel.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, attributes } = req.body;
    const userId = req.user.id;

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

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is available from the JWT token

    const cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product", "name price url") // Adjust fields as needed
      .lean(); // Use lean() for better performance if you don't need Mongoose document methods

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    // Calculate total price
    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Format the response
    const formattedCart = {
      _id: cart._id,
      user: cart.user,
      items: cart.items.map((item) => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.url,
        },
        quantity: item.quantity,
        attributes: item.attributes,
      })),

      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ message: "Error fetching user cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, attributes } = req.body;

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.attributes) === JSON.stringify(attributes)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    if (cart.items.length === 0) {
      await cartModel.findByIdAndDelete(cart._id);
      return res
        .status(200)
        .json({ message: "Cart is now empty and has been removed" });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res
      .status(200)
      .json({ message: "Item removed from cart successfully", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, attributes } = req.body;

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.attributes) === JSON.stringify(attributes)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity and attributes
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].attributes = attributes;

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Cart item updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Error updating cart item" });
  }
};

// export const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity, attributes } = req.body;
//     const userId = req.user.id; // Assuming you have middleware to extract user ID from JWT

//     console.log(userId, "userid");

//     let cart = await cartModel.findOne({ user: userId });

//     if (!cart) {
//       cart = new cartModel({ user: userId, items: [] });
//     }

//     const existingItemIndex = cart.items.findIndex(
//       (item) =>
//         item.product.toString() === productId &&
//         JSON.stringify(item.attributes) === JSON.stringify(attributes)
//     );

//     if (existingItemIndex > -1) {
//       cart.items[existingItemIndex].quantity += quantity;
//     } else {
//       cart.items.push({ product: productId, quantity, attributes });
//     }

//     cart.updatedAt = new Date();

//     await cart.save();

//     res.status(200).json({ message: "Item added to cart successfully", cart });
//   } catch (error) {
//     console.error("Error adding item to cart:", error);
//     res.status(500).json({ message: "Error adding item to cart" });
//   }
// };

// export const removeFromCart = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming the user ID is available from the JWT token
//     const { productId, quantity, attributes } = req.body;

//     // Find the user's cart
//     const cart = await cartModel.findOne({ user: userId });

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     // Find the index of the item in the cart
//     const itemIndex = cart.items.findIndex((item) => {
//       console.log(item.product.toString(), productId);
//       item.product.toString() === productId &&
//         JSON.stringify(item.attributes) === JSON.stringify(attributes);
//     });

//     if (itemIndex === -1) {
//       return res.status(404).json({ message: "Item not found in cart" });
//     }

//     // If quantity is not provided or is greater than or equal to the current quantity, remove the entire item
//     if (!quantity || quantity >= cart.items[itemIndex].quantity) {
//       cart.items.splice(itemIndex, 1);
//     } else {
//       // Otherwise, reduce the quantity
//       cart.items[itemIndex].quantity -= quantity;
//     }

//     // If cart becomes empty, you might want to delete it entirely
//     if (cart.items.length === 0) {
//       await cartModel.findByIdAndDelete(cart._id);
//       return res
//         .status(200)
//         .json({ message: "Cart is now empty and has been removed" });
//     }

//     // Save the updated cart
//     cart.updatedAt = new Date();
//     await cart.save();

//     res
//       .status(200)
//       .json({ message: "Item removed from cart successfully", cart });
//   } catch (error) {
//     console.error("Error removing item from cart:", error);
//     res.status(500).json({ message: "Error removing item from cart" });
//   }
// };

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
