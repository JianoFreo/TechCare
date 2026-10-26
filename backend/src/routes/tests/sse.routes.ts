import { Router } from "express";
import { test, getMessagesSSE,  writeMessageSSE } from "../../controllers/test/sse.controller.js";
const router = Router();

router.get("/", test);
router.get("/stream-sse", getMessagesSSE);
router.post("/write-sse", writeMessageSSE);

export default router;