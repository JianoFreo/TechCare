import { Router } from "express";
import {
  getRoomSpecificServices,
  getLaboratoryQueueItems,
  getAnalysisReadyRequests,
  getAvailableFormTemplates,
  getLaboratoryQueues,
  getLaboratoryRequestDetails,
} from "../controllers/labstaff/getRequests.controller.js";
import { updateQueueStatus, skipQueueEntry, cancelQueueEntry } from "../controllers/labstaff/updateRequest.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import labstaffMiddleware from "../middlewares/labstaff.middleware.js";
import { ENV } from "../config/env.js";
const router = Router();
if (ENV.IS_PRODUCTION) {
  router.use(authMiddleware, labstaffMiddleware);
  console.log("Lab Staff routes enabled");
}
// GET ROUTES
router.get("/laboratory-queues/room/:room", getLaboratoryQueues);
router.get("/services/:room", getRoomSpecificServices);
router.get("/laboratory-queues/:queue_id/items", getLaboratoryQueueItems);
router.get("/laboratory-queues/:queue_id/request", getLaboratoryRequestDetails);
router.get("/laboratory-requests/items/", getAnalysisReadyRequests);
router.get("/laboratory-results/form-templates/", getAvailableFormTemplates);
// POST ROUTES

// UPDATE ROUTES
router.patch("/laboratory-queues/:queue_id/status", updateQueueStatus);
router.patch("/laboratory-queues/:queue_id/skip", skipQueueEntry);
// DELETE ROUTES
export default router;
