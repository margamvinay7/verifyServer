import { Influencer } from "../models/influencer.model.js";
import { Claim } from "../models/claim.model.js";

export const getAnalyticsService = async () => {
  const totalInfluencers = await Influencer.countDocuments();

  const distinctCategories = await Influencer.distinct("category");

  const verifiedClaimsCount = await Claim.countDocuments({
    verificationStatus: "Verified",
  });

  const trustScoreData = await Influencer.aggregate([
    {
      $group: {
        _id: null,
        avgTrustScore: { $avg: "$trustScore" }, // Calculate average trustScore
      },
    },
  ]);

  const averageTrustScore = trustScoreData[0]?.avgTrustScore || 0; // Handle case with no influencers

  return {
    totalInfluencers,
    distinctCategories,
    verifiedClaimsCount,
    averageTrustScore,
  };
};
