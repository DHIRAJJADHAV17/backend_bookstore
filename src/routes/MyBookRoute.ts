import express from "express";
import MyBookController from "../controller/MyBookController";
const router = express.Router();
import multer from "multer";
import AccessToken from "../middleware/AccessToken";
import { param } from "express-validator";
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.post(
  "/",
  upload.single("imageFile"),
  AccessToken,
  MyBookController.createMyBook
);
router.get("/", MyBookController.getAllbook);
router.get("/admin", AccessToken, MyBookController.getAdminbook);
router.get(
  "/view/:id",
  param("id")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("id parameter must be a valid string"),
  MyBookController.getviewbook
);

router.put(
  "/view/:id",
  upload.single("imageFile"),
  param("id")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("id parameter must be a valid string"),

  MyBookController.updateMybook
);

router.get(
  "/search/:title",
  param("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("title parameter must be a valid string"),

  MyBookController.searchbook
);
router.get(
  "/admin/search/:title",
  AccessToken,
  param("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("title parameter must be a valid string"),

  MyBookController.searchadminbook
);
export default router;
