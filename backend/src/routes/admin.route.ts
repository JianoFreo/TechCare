import { Router } from "express";
import {
  getAllUsers,
  getAllservices,
  getMyActivities,
  getAllActivities,
} from "../controllers/admin/getRequests.controller.js";
import {
  addUser,
  addService,
  addActivity,
} from "../controllers/admin/postRequests.controller.js";
import { updateUser } from "../controllers/admin/updateRequests.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
const router = Router();

// router.use(authMiddleware, adminMiddleware);


router.get("/services", getAllservices);
router.get("/activity", getMyActivities);
router.get("/activities", getAllActivities);
router.get("/users", getAllUsers);
router.post("/users", addUser);
router.post("/services", addService);
router.patch("/users/:user_id", updateUser);
router.post("/activities", addActivity);

export default router;
