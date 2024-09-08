import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(200).send();
    }

    const newUser = new User(req.body);
    await newUser.save();
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }
    const accessToken = jwt.sign({ newUser }, accessTokenSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({ newUser, accessToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error in creating user" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if access token secret is defined
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    // Check if the provided password matches the stored password
    const isMatch = await currentUser.matchPassword(password);
    if (!isMatch) {
      return res.json({
        error: true,
        message: "Invalid credentials",
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: currentUser._id },
      accessTokenSecret,
      {
        expiresIn: "7d",
      }
    );

    // Return success response
    return res.json({
      error: false,
      message: "Login successful",
      accessToken,
      user: currentUser,
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong while logging in" });
  }
};
export default {
  createUser,
  getUser,
};
