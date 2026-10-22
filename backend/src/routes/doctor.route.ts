import { Router } from "express";
import { ENV } from "../config/env.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import doctorMiddleware from "../middlewares/doctor.middleware.js";
import {
  acceptConsultationQueue,
  cancelConsultationQueue,
} from "../controllers/doctor/updateRequests.controller.js";
import { getReleasedLaboratoryResult } from "../controllers/labstaff/getRequests.controller.js";
import {
  addLaboratoryRequest,
  addPrescriptions,
  addConsultationFindings
} from "../controllers/doctor/postRequests.controller.js";
import {
  getMedicalHistory,
  getMedicalHistoryDetails,
  getMedicalHistoryFull
  // getLaboratoryServices,
  // getConsultationPatient,
} from "../controllers/doctor/getRequests.controller.js";
const router = Router();

if (ENV.IS_PRODUCTION) {
  router.use(authMiddleware, doctorMiddleware);
  console.log("Doctor routes enabled");
}
// POST requests
router.post("/laboratory-requests", addLaboratoryRequest);
router.post("/consultations", addConsultationFindings);
router.post("/prescriptions/:consultation_record_id", addPrescriptions);
// GET requests
router.get("/laboratory-results/:result_id", getReleasedLaboratoryResult);
// router.get("/laboratory-services", getLaboratoryServices);
// router.get("/consultation-patients/:patient_id", getConsultationPatient);
router.get("/medical-history/:patient_id", getMedicalHistory);
router.get(
  "/medical-history/:record_type/:record_id",
  getMedicalHistoryDetails,
);
router.get(
  "/medical-history/:record_type/:record_id/full",
  getMedicalHistoryFull,
);

router.patch("/consultation-queues/:queue_id/accept", acceptConsultationQueue);
router.patch("/consultation-queues/:queue_id/cancel", cancelConsultationQueue);

export default router;
