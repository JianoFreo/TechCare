import { signIn, uploadImage, getUser, getMyAccount } from "../controllers/test.controller.js";
// import { upload } from "../middlewares/multer.middleware.js";
import { authenticateToken } from "../middlewares/test.middleware.js";

import { Router } from "express";
const router = Router();
router.post("/sign-in", signIn);
router.post("/", authenticateToken, getUser);
router.get("/get-my-account", authenticateToken, getMyAccount);
router.get("/ping", (req, res) => {
  res.status(200).json({ message: "Service is awake and responding." });
});
// router.post("/upload-image", upload.single("image"), uploadImage);
export default router;
