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
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";

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
export default router;
