import { signIn, getUser, getMyAccount } from "../controllers/test.controller.js";
import { authenticateToken } from "../middlewares/test.middleware.js";

import { Router } from "express";
const router = Router();
router.post("/sign-in", signIn);
router.post("/", authenticateToken, getUser);
router.get("/get-my-account", authenticateToken, getMyAccount);
export default router;
