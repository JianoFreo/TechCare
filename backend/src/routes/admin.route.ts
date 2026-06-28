import { Router } from "express";
import {
  addUser,
  getAllservices,
  addService,
  updateUser,
  getAllUsers,
} from "../controllers/admin.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js"
import authMiddleware from "../middlewares/auth.middleware.js"
const router = Router();

router.use(authMiddleware, adminMiddleware)

router.get("/users", getAllUsers);
router.post("/users", addUser);
router.patch("/users/:user_id", updateUser);
router.get("/services", getAllservices);
router.post("/services", addService);


export default router;
