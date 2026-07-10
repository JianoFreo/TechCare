import { getAllservices } from "../controllers/admin/getRequests.controller.js";
import {
  getAllBilling,
  getAllPatients,
  getAllQueueEntries,
} from "../controllers/fdstaff/getRequests.controller.js";
import {
  addBills,
  addPatient,
  addQueueEntry,
} from "../controllers/fdstaff/postRequests.controller.js";
import { serveQueueEntry, skipQueueEntry, updatePatient } from "../controllers/fdstaff/updateRequests.controller.js";
import { deleteQueue } from "../controllers/fdstaff/deleteRequest.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { uploadImage } from "../controllers/test.controller.js";

const router = Router();

// GET requests
router.get("/patients", getAllPatients);
router.get("/billing", getAllBilling);
router.get("/services", getAllservices);
router.get("/queues", getAllQueueEntries);

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
//UPDATE requests
router.put("/queues/:queue_id", serveQueueEntry);
router.patch("/queues/:queue_id", skipQueueEntry);
router.put("/patients/:patient_id", upload.single("image"), updatePatient);
// DELETE requests
router.delete("/queues/:queue_id", deleteQueue); 
export default router;
  