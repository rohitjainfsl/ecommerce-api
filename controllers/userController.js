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
    console.log(email, password, role);
    let error = 0;

    const checkUser = await userModel.findOne({ email }).exec();

    if(!checkUser){ error = 1; return res.status(400).json({error: "Invalid username"});}
    
    if (await bcrypt.compare(password, checkUser.password) === false) {
      error = 1;
      return res.status(400).json({ error: "Invalid Password" });
    }
    if(checkUser.role !== role) { error = 1; return res.status(400).json({ error: "Invalid Role" })};

    if(error === 0){
      console.log("here");
    
      //Create a token using JWT
      const token = generateToken(checkUser);

      res
        .cookie("auth_token", token, {
          httpOnly: false,
          secure: "true",
          sameSite: "none",
          maxAge: 3600000,
        })
        .status(200)
        .json({
          message: "Login Successful",
          user: checkUser,
        });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

export async function logoutUser(req, res) {
  try {
    res.clearCookie("auth_token", {
      httpOnly: false,
      secure: "true",
      sameSite: "none",
    });
    res.status(200).json({ message: "Logout successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
