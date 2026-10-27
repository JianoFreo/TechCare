import { Router } from "express";
import { getMessagesSSE,  writeMessageSSE } from "../../controllers/test/sse/sse.controller.js";
const router = Router();

router.get("/stream-sse", getMessagesSSE);
router.post("/send-sse", writeMessageSSE);

export default router;