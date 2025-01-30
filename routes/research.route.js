import { Router } from "express";
import { createResearch } from "../controllers/research.controller.js";

const router = Router();

router.post("/createResearch", createResearch);

export default router;
