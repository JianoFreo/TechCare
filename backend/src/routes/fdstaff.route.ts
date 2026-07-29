import { getAllservices } from "../controllers/admin/getRequests.controller.js";
import {
  deletePatient,
  deleteQueue,
} from "../controllers/fdstaff/deleteRequest.controller.js";
import {
  getAllBilling,
  getAllPatients,
  getAllQueueEntries,
  getLaboratoryRequest,
} from "../controllers/fdstaff/getRequests.controller.js";
import {
  addBills,
  addLaboratoryRequest,
  addPatient,
  addQueueEntry,
} from "../controllers/fdstaff/postRequests.controller.js";
import {
  confirmLabRequestPayment,
  serveQueueEntry,
  skipQueueEntry,
  updatePatient,
} from "../controllers/fdstaff/updateRequests.controller.js";
import { uploadImage } from "../controllers/test.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";

const router = Router();

// GET requests
router.get("/patients", getAllPatients);
router.get("/billing", getAllBilling);
router.get("/services", getAllservices);
router.get("/queues", getAllQueueEntries);
router.get("/patients/:patient_id/laboratory-requests", getLaboratoryRequest);

// POST requests
router.post("/patients", upload.single("image"), addPatient);
//uploading multiple files
// router.post(
//   "/patients",
//   upload.array("images", 5), // up to 5 images
//   addPatient,
// );
router.post("/billing", addBills);
router.post("/queues", addQueueEntry);
router.post("/laboratory-requests", addLaboratoryRequest);
//UPDATE requests
router.put("/queues/:queue_id", serveQueueEntry);
router.patch("/queues/:queue_id", skipQueueEntry);
router.put("/patients/:patient_id", upload.single("image"), updatePatient);
router.patch("/laboratory-requests/:request_id", confirmLabRequestPayment);
// DELETE requests
router.delete("/queues/:queue_id", deleteQueue);
router.delete("/patients/:patient_id", deletePatient);
export default router;
