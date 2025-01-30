import { Router } from "express";
import {
  getInfluencers,
  getInfluencerWithClaims,
} from "../controllers/influencer.controller.js";

const router = Router();

router.get("/getInfluencers", getInfluencers);
router.get("/getInfluencerClaims", getInfluencerWithClaims);
export default router;
