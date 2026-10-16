import { Router } from "express";

import {
  getRoomSpecificServices,
  getLaboratoryQueueItems,
  getAnalysisReadyRequests,
  getAvailableFormTemplates,
  getLaboratoryQueues,
  getLaboratoryRequestDetails,
} from "../controllers/labstaff/getRequests.controller.js";

import {
  acceptQueueEntry,
  skipQueueEntry,
  cancelQueueEntry,
  completeQueueEntry,
} from "../controllers/labstaff/updateRequest.controller.js";

import {
  saveLaboratoryResult,
  addLaboratoryRequest,
} from "../controllers/labstaff/postRequests.controller.js";

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
router.post("/laboratory-requests", addLaboratoryRequest);
router.post("/laboratory-results/:lab_item_id", saveLaboratoryResult);

// PATCH ROUTES
router.patch("/laboratory-queues/:queue_id/accept", acceptQueueEntry);
router.patch("/laboratory-queues/:queue_id/skip", skipQueueEntry);
router.patch("/laboratory-queues/:queue_id/cancel", cancelQueueEntry);
router.patch("/laboratory-queues/:queue_id/complete", completeQueueEntry);

export default router;
