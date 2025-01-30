import {
  assignTrustScoreService,
  fetchAndCreateInfluencerService,
  getInfluencerService,
} from "../services/influencer.service.js";
import {
  createClaimService,
  extractClaimsService,
  isDuplicateClaimService,
  verifyClaimService,
  fetchTweetsService,
  getClaimsService,
} from "../services/claim.service.js";
import {
  calculateDateRange,
  createResearchService,
} from "../services/research.service.js";

export const createResearch = async (req, res) => {
  try {
    const {
      timeRange,
      products,
      claimLimit,
      journals,
      notes,
      username,
      verifyWithJournals,
    } = req.body;
    const { startDate, endDate } = calculateDateRange(timeRange);

    let influencer = await getInfluencerService(username);
    if (!influencer) {
      influencer = await fetchAndCreateInfluencerService(username);
    }

    const tweets = await fetchTweetsService(username, claimLimit);
    const existingClaims = (await getClaimsService(influencer._id)).map(
      (claim) => claim.text
    );

    await Promise.all(
      tweets.map(async (tweet) => {
        const claims = await extractClaimsService(tweet.text);

        await Promise.all(
          claims.map(async (claim) => {
            const isDuplicate = await isDuplicateClaimService(
              claim,
              existingClaims
            );
            if (!isDuplicate) {
              let verification;
              if (verifyWithJournals) {
                verification = await verifyClaimService(claim, journals);
              } else {
                verification = await verifyClaimService(claim);
              }
              await createClaimService(
                verification,
                claim,
                influencer._id,
                influencer.username,
                tweet.tweet_id
              );
            }
          })
        );
      })
    );

    await assignTrustScoreService(influencer._id);

    const UpdatedInfluencer = await getInfluencerService(username);

    const research = await createResearchService({
      influencerId: UpdatedInfluencer._id,
      claimLimit,
      products,
      journals,
      notes,
      trustScore: UpdatedInfluencer.trustScore,
      dateRange: { startDate, endDate },
    });

    res.status(200).json({
      success: true,
      message: "Research completed successfully",
      research: research,
    });
  } catch (error) {
    console.error("Error in research:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
