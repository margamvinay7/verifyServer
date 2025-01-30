import axios from "axios";
import { Claim } from "../models/claim.model.js";
import openai from "../config/openai.js";
export const fetchTweetsService = async (username, limit) => {
  const options = {
    method: "GET",
    url: "https://twitter154.p.rapidapi.com/user/tweets",
    params: {
      username: username,
      limit: limit,
    },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "twitter154.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);

    // console.log("fetch tweets", response);

    return response.data.results.map((post) => ({
      tweetId: post.tweet_id,
      text: post.text,
      createdAt: post.creation_date,
    }));
  } catch (error) {
    // console.error("Error fetching tweets:", error.message);
    throw new Error("Failed to fetch tweets.");
  }
};

// Extract Claims
export const extractClaimsService = async (content) => {
  try {
    const prompt = `Extract all health-related claims from the following content and categorize them as Nutrition, Medicine, Mental Health, or Other. If the content is not related to health, exclude it:
    \n"${content}"\n
    Format: "Claim | Category"`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: prompt }],
    });

    const claimsText = response.choices[0].message.content.trim();

    // console.log(
    //   "extract claim",
    //   claimsText,
    //   claimsText
    //     .split("\n")
    //     .filter((claim) => claim.trim()) // Remove empty lines
    //     .map((line) => {
    //       const [claim, category] = line.split("|", 2);
    //       return {
    //         text: claim.trim(),
    //         category: category ? category.trim() : "Other",
    //       };
    //     })
    //     .filter((claim) => claim.category !== "Other")
    // );

    const claims = claimsText
      .split("\n")
      .filter((claim) => claim.trim())
      .map((line) => {
        const [claim, category] = line.split("|", 2);
        return {
          text: claim.trim(),
          category: category ? category.trim() : "Other",
        };
      })
      .filter((claim) => claim.category !== "Other");

    // console.log("Extracted claims:", claims);
    return claims;
  } catch (error) {
    console.error("Error extracting claims:", error.message);
    throw new Error("Failed to extract claims.");
  }
};

// Deduplicate Claims
export const isDuplicateClaimService = async (newClaim, existingClaims) => {
  try {
    const prompt = `Check if the following claim is a duplicate of any in this list: \nClaim: "${newClaim}" \nList: ${existingClaims.join(
      "\n"
    )}. Respond with only "yes" or "no".`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: prompt }],
    });

    const isDuplicate =
      response.choices[0].message.content.trim().toLowerCase() === "yes";

    // console.log("is duplicate:", isDuplicate, response.choices[0].message);
    return isDuplicate;
  } catch (error) {
    console.error("Error checking duplicate claims:", error.message);
    throw new Error("Failed to check duplicate claims.");
  }
};

// Verify Claims
export const verifyClaimService = async (claim, journals = []) => {
  try {
    const journalSources = journals.length
      ? `Cross-reference it with trusted sources like PubMed, WHO, and the following journals: ${journals.join(
          ", "
        )}`
      : `Cross-reference it with trusted sources like PubMed and WHO.`;

    const prompt = `Verify the following health claim: "${claim}".
    ${journalSources}
    Provide the result in JSON format as:
    {
      "verificationStatus": "Verified | Questionable | Debunked",
      "trustScore": 0-100,
      "reasoning": "Brief explanation",
      "aiAnalysis": "Detailed analysis"
    }`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0].message.content.trim();

    // console.log("verify claim", result, response.choices[0].message);
    return {
      verificationStatus: result?.verificationStatus,
      trustScore: result?.trustScore,
      reasoning: result?.reasoning,
      aiAnalysis: result?.aiAnalysis,
    };
  } catch (error) {
    console.error("Error verifying claim:", error.message);
    throw new Error("Failed to verify claim.");
  }
};

export const createClaimService = async (
  verification,
  claim,
  influencerId,
  username,
  tweetId
) => {
  const newClaim = await Claim.create({
    influencerId: influencerId,
    text: claim.text,
    tweet_id: tweetId,
    category: claim.category,
    verificationStatus: verification.verificationStatus,
    trustScore: verification.trustScore,
    aiAnalysis: verification.aiAnalysis,
    source: `https://x.com/${username}/status/${tweetId}`,
  });
  // console.log("create claim", newClaim);
  return newClaim;
};

export const getClaimsService = async (influencerId) => {
  return await Claim.find({ influencerId });
};

export const getClaimsFilterService = async (filter, page = 1) => {
  const limit = 10;
  const skip = (page - 1) * limit;
  const claims = await Claim.find(filter).skip(skip).limit(limit);

  const totalClaims = await Claim.countDocuments(filter);

  return {
    totalClaims,
    totalPages: Math.ceil(totalClaims / limit),
    currentPage: page,
    claims,
  };
};

export const getCategoriesService = async () => {
  return await Claim.distinct("category");
};
