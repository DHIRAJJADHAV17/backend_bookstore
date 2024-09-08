import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
const AccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }
  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "token not found",
    });
  }
  try {
    const accTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accTokenSecret) {
      return res.status(500).json({
        message: "Access token secret is not configured",
      });
    }
    const decode = jwt.verify(token, accTokenSecret) as any;

    req.user = await User.findById(decode.userId);

    if (!req.user) return res.status(401);
    next();
  } catch (error) {
    return res.status(403).json({
      massage: "invalid token",
    });
  }
};

export default AccessToken;
