import { Router } from "express";
import {
  addUser,
  getAllservices,
  addService,
  updateUser,
  getAllUsers,
} from "../controllers/admin.controller.js";
const router = Router();
router.get("/users", getAllUsers);
router.post("/users", addUser);
router.patch("/users/:user_id", updateUser);
router.get("/services", getAllservices);
router.post("/services", addService);


export default router;
