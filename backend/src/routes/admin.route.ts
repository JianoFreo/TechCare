import { Router } from "express";
import {
  addUser,
  getAllservices,
  addService,
  updateUser,
  getAllUsers,
  getMyActivities,
  getAllActivities,
  addActivity
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
router.get("/activity", getMyActivities);
router.get("/activities", getAllActivities);
router.post("/activities", addActivity);


export default router;
