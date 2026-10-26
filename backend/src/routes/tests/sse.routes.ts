import { Router } from "express";
import { test, getMessagesSSE,  writeMessageSSE } from "../../controllers/test/sse.controller.js";
const router = Router();

router.get("/", test);
router.get("/streamSSE", getMessagesSSE);
router.post("/streamSSE", writeMessageSSE);

export default router;