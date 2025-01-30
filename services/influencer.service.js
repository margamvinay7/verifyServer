import axios from "axios";
import { Influencer } from "../models/influencer.model.js";
import {
  getCategoriesService,
  getClaimsFilterService,
  getClaimsService,
} from "./claim.service.js";

export const fetchAndCreateInfluencerService = async (username) => {
  const options = {
    method: "GET",
    url: "https://twitter154.p.rapidapi.com/user/details",
    params: {
      username: username,
    },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "twitter154.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    console.log("fetch influencers", response);
    const data = response.data;

    const influencer = {
      name: data.name,
      userId: data.user_id,
      username: data.username,
      platform: "Twitter",
      followers: data.follower_count,
      profilePic: data.profile_pic_url,
      description: data.description,
    };

    const newInfluencer = await Influencer.create(influencer);
    return newInfluencer;
  } catch (error) {
    console.error("Error fetching influencers:", error.message);
    throw new Error("Failed to fetch and create influencer.");
  }
};

// fetch influencers from a twitter platfrom rapid api in case of fetching influencers on health category from a internet or any platform
export const fetchInfluencersService = async () => {
  const options = {
    method: "GET",
    url: "https://twitter135.p.rapidapi.com/Search/",
    params: {
      q: "health",
      count: "20",
      type: "Top",
      safe_search: "true",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "twitter135.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log("fetch influencers", response);
    const influencers = response.data.map((influencer) => ({
      name: influencer.name,
      userId: influencer.user_id,
      username: influencer.username,
      platform: "Twitter",
      followers: influencer.follower_count,
    }));

    return influencers;
  } catch (error) {
    console.error("Error fetching influencers:", error.message);
  }
};

export const assignTrustScoreService = async (influencerId) => {
  try {
    const claims = await getClaimsService(influencerId);
    if (claims.length === 0) {
      await Influencer.findByIdAndUpdate(influencerId, { trustScore: 0 });
      return 0;
    }
    const totalScore = claims.reduce((acc, claim) => {
      if (claim.verificationStatus === "Verified") return acc + 10;
      if (claim.verificationStatus === "Questionable") return acc + 5;
      if (claim.verificationStatus === "Debunked") return acc - 10;
      return acc;
    }, 0);

    const trustScore = claims.length > 0 ? totalScore / claims.length : 0;
    await Influencer.findByIdAndUpdate(influencerId, { trustScore });
    console.log("trust", trustScore);
    return trustScore;
  } catch (error) {
    console.error("Error assigning trust score:", error.message);
    throw new Error("Failed to assign trust score.");
  }
};

export const getInfluencerService = async (username) => {
  try {
    const influencer = await Influencer.findOne({ username });
    return influencer;
  } catch (error) {
    console.error("Error fetching influencer:", error);
    throw new Error("Failed to fetch influencer");
  }
};

export const getInfluencersService = async (page) => {
  const limit = 10;
  const skip = (page - 1) * limit;

  return await Influencer.find({})
    .sort({ trustScore: -1 })
    .skip(skip)
    .limit(limit);
};

export const getInfluencerWithClaimsService = async (filters) => {
  const { username, category, verificationStatus, date, page } = filters;

  const influencer = await getInfluencerService(username);

  if (!influencer) throw new Error("Influencer not found");

  const claimsQuery = { influencerId: influencer._id };

  if (category) claimsQuery.category = category;
  if (verificationStatus) claimsQuery.verificationStatus = verificationStatus;
  if (date) {
    claimsQuery.createdAt = date;
  }

  const categories = await getCategoriesService();

  const claims = await getClaimsFilterService(claimsQuery, page);

  return { influencer, categories, claims };
};
