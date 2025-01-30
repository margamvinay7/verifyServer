import {
  getInfluencersService,
  getInfluencerWithClaimsService,
} from "../services/influencer.service.js";

export const getInfluencers = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const influencers = await getInfluencersService(page);
    res.status(200).json({ success: true, data: influencers });
  } catch (error) {
    console.log("Error fetching influencers: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInfluencerWithClaims = async (req, res) => {
  try {
    const filters = req.query; // Assuming filters are passed as query params
    const data = await getInfluencerWithClaimsService(filters);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};
