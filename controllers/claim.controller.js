import { getClaimsService } from "../services/claim.service.js";
import { getInfluencerService } from "../services/influencer.service.js";

export const getClaims = async (req, res) => {
  try {
    const { username } = req.body;
    const influencer = await getInfluencerService(username);
    const claims = await getClaimsService(influencer._id);
    res.status(200).json(claims);
  } catch (error) {
    console.log("Error fetching claims: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
