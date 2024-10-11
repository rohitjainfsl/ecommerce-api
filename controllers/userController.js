import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../services/tokenGenerate.js";

export async function registerUser(req, res) {
  try {
    let { firstname, lastname, email, password, role, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;
    const user = new userModel({
      firstname,
      lastname,
      email,
      password,
      role,
      gender,
    });
    await user.save();
    res.status(201).json({ message: "success", user: user });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password, role } = req.body;
    // console.log(email, password, role);

    const checkUser = await userModel.findOne({ email }).exec();

    if (
      !checkUser ||
      !bcrypt.compare(password, checkUser.password) ||
      checkUser.role !== role
    ) {
      return res.status(500).json({ error: "Invalid Credentials" });
    }

    //Create a token using JWT
    const token = generateToken(checkUser);

    // Option 1: Send token in response body
    // return res.status(200).json({
    //   message: "Login successful",
    //   token,
    // });

    res
      .cookie("auth_token", token, {
        httpOnly: false,
        secure: false, //as we are working with localhost, which runs on http, not on https
        sameSite: "strict",
        maxAge: 3600000,
      })
      .status(200)
      .json({
        message: "Login Successful",
      });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

export async function logoutUser(req, res) {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    });
    res.status(200).json({ message: "Logout successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
