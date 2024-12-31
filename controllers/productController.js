import { productModel } from "../models/productModel.js";
import { userModel } from "../models/userModel.js";
import { uploadToCloudinary } from "../services/cloudinaryUpload.js";

export async function createProduct(req, res) {
  try {
    let url = await uploadToCloudinary(req);
    console.log(url, "uploaded file");

    let { name, brand, category, price, description, inStock, inventory } =
      req.body;
    const product = new productModel({
      name,
      url,
      brand,
      category,
      price,
      description,
      inStock,
      inventory,
      addedBy: "66e84ce94ba20855a40f9a1e",
    });
    // console.log(product);
    await product.save();
    res.status(201).json({ message: "product added" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

//FETCH ALL PRODUCTS
export async function getAllProducts(req, res) {
  try {
    let query = {};
    let sortOption = {};
    let aggregationPipeline = [];

    // Brand filter
    if (req.query.brand) {
      query.brand = req.query.brand;
      query.brand = { $regex: new RegExp(`^${req.query.brand}$`, "i") };
    }

    // Category filter
    if (req.query.category) {
      // query.category = req.query.category;
      query.category = { $regex: new RegExp(`^${req.query.category}$`, "i") };
    }

    // Price filter
    if (req.query.price) {
      const priceOperators = {
        ">": "$gt",
        "<": "$lt",
        ">=": "$gte",
        "<=": "$lte",
        "=": "$eq",
      };

      Object.keys(priceOperators).forEach((operator) => {
        if (req.query.price.startsWith(operator)) {
          query.price = {
            [priceOperators[operator]]: parseFloat(
              req.query.price.slice(operator.length)
            ),
          };
        }
      });
    }

    if (req.query.sortBy && req.query.sort) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sort.toLowerCase() === "desc" ? -1 : 1;

      if (["price", "category"].includes(sortField)) {
        sortOption[sortField] = sortOrder;
      }
    }

    // const products = await productModel.find(query).sort(sortOption);

    aggregationPipeline = [
      { $match: query },
      {
        $addFields: {
          ratings: {
            $ifNull: ["$ratings", []],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ratings.postedBy",
          foreignField: "_id",
          as: "ratingUsers",
        },
      },
      {
        $addFields: {
          ratings: {
            $map: {
              input: "$ratings",
              as: "rating",
              in: {
                $mergeObjects: [
                  "$$rating",
                  {
                    postedBy: {
                      $let: {
                        vars: {
                          user: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$ratingUsers",
                                  cond: {
                                    $eq: ["$$this._id", "$$rating.postedBy"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          _id: "$$user._id",
                          fullName: {
                            $concat: [
                              { $ifNull: ["$$user.firstname", ""] },
                              {
                                $cond: [
                                  {
                                    $and: [
                                      { $ifNull: ["$$user.firstname", false] },
                                      { $ifNull: ["$$user.lastname", false] },
                                    ],
                                  },
                                  " ",
                                  "",
                                ],
                              },
                              { $ifNull: ["$$user.lastname", ""] },
                            ],
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          ratingUsers: 0,
          "ratings.postedBy.password": 0,
          "ratings.postedBy.email": 0,
          // Add any other fields you want to exclude
        },
      },
    ];

    // Add sort stage only if sortOption is not empty
    if (Object.keys(sortOption).length > 0) {
      aggregationPipeline.push({ $sort: sortOption });
    }

    // const products = await productModel.aggregate([
    //   { $match: query },
    //   {
    //     $addFields: {
    //       ratings: {
    //         $ifNull: ["$ratings", []],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "ratings.postedBy",
    //       foreignField: "_id",
    //       as: "ratingUsers",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       ratings: {
    //         $map: {
    //           input: "$ratings",
    //           as: "rating",
    //           in: {
    //             $mergeObjects: [
    //               "$$rating",
    //               {
    //                 postedBy: {
    //                   $let: {
    //                     vars: {
    //                       user: {
    //                         $arrayElemAt: [
    //                           {
    //                             $filter: {
    //                               input: "$ratingUsers",
    //                               cond: {
    //                                 $eq: ["$$this._id", "$$rating.postedBy"],
    //                               },
    //                             },
    //                           },
    //                           0,
    //                         ],
    //                       },
    //                     },
    //                     in: {
    //                       _id: "$$user._id",
    //                       fullName: {
    //                         $concat: [
    //                           { $ifNull: ["$$user.firstname", ""] },
    //                           {
    //                             $cond: [
    //                               {
    //                                 $and: [
    //                                   { $ifNull: ["$$user.firstname", false] },
    //                                   { $ifNull: ["$$user.lastname", false] },
    //                                 ],
    //                               },
    //                               " ",
    //                               "",
    //                             ],
    //                           },
    //                           { $ifNull: ["$$user.lastname", ""] },
    //                         ],
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       ratingUsers: 0,
    //       "ratings.postedBy.password": 0,
    //       "ratings.postedBy.email": 0,
    //       // Add any other fields you want to exclude
    //     },
    //   },
    //   { $sort: sortOption },
    // ]);

    const products = await productModel.aggregate(aggregationPipeline);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

//FETCH ALL CATEGORIES
export async function getProductCategories(req, res) {
  try {
    const categories = await productModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBrandsInCategory(req, res) {
  try {
    const { category } = req.params;
    const brands = await productModel.distinct("brand", {
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const idToDelete = req.params.id;
    const productDeleted = await productModel.findByIdAndDelete(idToDelete);
    if (productDeleted) res.json({ message: "Product Deleted" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

//FETCH A SINGLE PRODUCT

export async function getSingleProduct(req, res) {
  const idToFind = req.params.id;
  const singleProduct = await productModel
    .findById({ _id: idToFind })
    // .populate("ratings.postedBy", "firstname", "lastname")
    .populate({ path: "ratings.postedBy", select: "firstname lastname" })
    .select("-password");
  res.json(singleProduct);
}

export async function addToWishlist(req, res) {
  const { productID } = req.params;
  const userID = req.user._id;
  let updatedUser;

  //GATHER ALL THE DATA FOR THIS USER

  //CHECK WHETHER PRODUCT IS ALREADY ADDED
  const user = req.user;
  const existingProduct = user.wishlist.find((ids) => ids === productID);
  if (!existingProduct) {
    //push productID into wishlist
    updatedUser = await userModel.findByIdAndUpdate(
      userID,
      { $push: { wishlist: productID } },
      { new: true }
    );
  } else {
    //remove productID from wishlist
    updatedUser = await userModel.findByIdAndUpdate(
      userID,
      {
        $pull: { wishlist: productID },
      },
      { new: true }
    );
  }
  res.json(updatedUser);
}

export async function rating(req, res) {
  const userID = req.user._id;
  const { star, productId, comment } = req.body;

  try {
    //FIND THE PRODUCT BY ID
    const product = await productModel.findById(productId);

    //CHECK IF THE USER HAS ALREADY RATED THE PRODUCT
    const alreadyRated = product.ratings.find(
      (ratingObject) => ratingObject.postedBy.toString() === userID.toString()
    );

    let updatedProduct;

    if (alreadyRated) {
      //IF ALREADY RATED:
      // UPDATE THE RATING
      // console.log("already rated");

      updatedProduct = await productModel.findOneAndUpdate(
        {
          _id: productId,
          "ratings.postedBy": userID,
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
          },
        },
        { new: true }
      );
      updatedProduct.populate("ratings.postedBy", "name");
    } else {
      //IF IT'S A NEW RATING:
      // ADD A NEW RATING
      // console.log("new rating");

      updatedProduct = await productModel.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              postedBy: userID,
              comment: comment,
            },
          },
        },
        { new: true }
      );
    }

    // RECALCULATE TOTAL RATING

    // GET TOTAL NUMBER OF RATINGS
    const totalRating = updatedProduct.ratings.length;
    console.log(totalRating);
    // GET THE SUM OF ALL STARS
    const ratingSum = updatedProduct.ratings.reduce(
      (sum, item) => sum + item.star,
      0
    );
    // GET THE AVERAGE
    const actualRating = Math.round(ratingSum / totalRating);

    // UPDATE PRODUCT WITH NEW TOTAL RATING
    const finalProduct = await productModel.findByIdAndUpdate(
      productId,
      { totalRating: actualRating },
      { new: true }
    );

    res.json(finalProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOptions(req, res) {
  const { whatToGet } = req.query();
  console.log(whatToGet);
}
