import { Router } from "express";
import { getAllPatients, getAllBilling } from "../controllers/fdstaff/getRequests.controller.js";
import { addPatient, addBilling } from "../controllers/fdstaff/postRequests.controller.js";

const router = Router();

// GET requests
router.get("/patients", getAllPatients);
router.get("/billing", getAllBilling);

// POST requests
router.post("/patients", addPatient);
router.post("/billing", addBilling);