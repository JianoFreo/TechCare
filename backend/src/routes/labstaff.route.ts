import { Router } from "express";
import {
  getAllLaboratoryPaid,
  getPatientInfo,
  getLaboratoryRequest,
} from "../controllers/labstaff/getRequests.controller.js";
import {
  updateLabRequestStatus,
  updateQueueStatus,
} from "../controllers/labstaff/updateRequest.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import labstaffMiddleware from "../middlewares/labstaff.middleware.js";
const router = Router();
if (process.env.MODE === "production") {
  router.use(authMiddleware, labstaffMiddleware);
  console.log("Lab Staff routes enabled");
}
// GET ROUTES
router.get("/laboratory-requests", getAllLaboratoryPaid);
router.get("/laboratory-requests/:request_id", getLaboratoryRequest);
router.get("/patients/:patient_id", getPatientInfo);

// POST ROUTES

// UPDATE ROUTES
router.patch("/laboratory-requests/:request_id", updateLabRequestStatus);
router.patch("/queue/:queue_id", updateQueueStatus);

// DELETE ROUTES
export default router;
