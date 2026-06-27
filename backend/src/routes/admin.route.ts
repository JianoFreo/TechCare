import { Router } from "express";
import {
  addUser,
  getAllservices,
  updateUser,
  getAllUsers,
} from "../controllers/admin.controller.js";
const router = Router();
router.get("/users", getAllUsers);
router.post("/users", addUser);
router.get("/services", getAllservices);
router.patch("/users/:user_id", updateUser);

export default router;
