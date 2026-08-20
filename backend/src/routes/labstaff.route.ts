import { Router } from "express";
import {
  getAllLaboratoryPaid,
  getLaboratoryRequest,
  getRoomSpecificServices,
  getAllLaboratorySpecificQueues,
  getLaboratoryQueueItems,
} from "../controllers/labstaff/getRequests.controller.js";
import {
  updateLabRequestStatus,
  updateQueueStatus,
} from "../controllers/labstaff/updateRequest.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import labstaffMiddleware from "../middlewares/labstaff.middleware.js";
import { ENV } from "../config/env.js";
const router = Router();
if (ENV.IS_PRODUCTION) {
  router.use(authMiddleware, labstaffMiddleware);
  console.log("Lab Staff routes enabled");
}
// GET ROUTES
router.get("/laboratory-requests", getAllLaboratoryPaid);
router.get("/laboratory-requests/:request_id", getLaboratoryRequest);
router.get("/laboratory-queues/:room", getAllLaboratorySpecificQueues);
router.get("/services/:room", getRoomSpecificServices);
router.get("/laboratory-queues/:queue_id/items", getLaboratoryQueueItems);

// POST ROUTES

// UPDATE ROUTES
router.patch("/laboratory-requests/:request_id", updateLabRequestStatus);
router.patch("/queues/:queue_id", updateQueueStatus);

// DELETE ROUTES
export default router;
