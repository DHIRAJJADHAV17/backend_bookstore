import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import UserRoutes from "./routes/MyUserRoutes";
import BookRoutes from "./routes/MyBookRoute";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

mongoose
  .connect(process.env.MONGODB_CONNECTION as string)
  .then(() => console.log("connected to database"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json());
app.use(cors());

app.get("/test", async (req: Request, res: Response) => {
  res.json({
    message: "Hello !",
  });
});

app.use("/api/my/user", UserRoutes);
app.use("/api/my/book", BookRoutes);

app.listen(7000, () => {
  console.log("Server started");
});
