import express from "express";
import MyUserController from "../controller/MyUserController";

const router = express.Router();

router.post("/login", MyUserController.getUser);
router.post("/signup", MyUserController.createUser);

export default router;
