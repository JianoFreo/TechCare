import { Router } from "express";
import { streamSSE, test } from "../../controllers/test/sse.controller.js";
const router = Router();

router.get("/", test);
router.get("/streamSSE", streamSSE);

export default router;