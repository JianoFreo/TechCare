import { Router } from "express";
import {
  getAllPatients,
  getAllBilling,
} from "../controllers/fdstaff/getRequests.controller.js";
import {
  addPatient,
  addBills,
  addQueueEntry,
} from "../controllers/fdstaff/postRequests.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { getAllservices } from "../controllers/admin/getRequests.controller.js";

const router = Router();

// GET requests
router.get("/patients", getAllPatients);
router.get("/billing", getAllBilling);
router.get("/services", getAllservices);

// POST requests
router.post("/patients", upload.single("image"), addPatient);
//uploading multiple files
// router.post(
//   "/patients",
//   upload.array("images", 5), // up to 5 images
//   addPatient,
// );
router.post("/billing", addBills);
router.post("/queue", addQueueEntry);
export default router;
