import { Router } from "express";
import { getMessagesSSE, test } from "../../controllers/test/sse.controller.js";
const router = Router();

router.get("/", test);
router.get("/streamSSE", getMessagesSSE);

export default router;