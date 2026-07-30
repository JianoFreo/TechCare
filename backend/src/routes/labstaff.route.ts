import { Router } from "express";
import {
  getAllLaboratoryRequests,
  getPatientInfo,
  getLaboratoryRequest,
} from "../controllers/labstaff/getRequests.controller.js";
import { updateLabRequestStatus } from "../controllers/labstaff/updateRequest.controller.js";
const router = Router();

// GET ROUTES
router.get("/laboratory-requests", getAllLaboratoryRequests);
router.get("/laboratory-requests/:request_id", getLaboratoryRequest);
router.get("/patients/:patient_id", getPatientInfo);

// POST ROUTES

// UPDATE ROUTES
router.patch("/laboratory-requests/:request_id", updateLabRequestStatus);

// DELETE ROUTES
export default router;
