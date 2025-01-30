import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  category: { type: String },
  followers: { type: Number, required: true },
  products: { type: Number },
  profilePic: { type: String },
  description: { type: String },
  trustScore: { type: Number, default: 0 },
  claimStats: {
    verified: { type: Number, default: 0 },
    questionable: { type: Number, default: 0 },
    debunked: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Influencer = mongoose.model("Influencer", influencerSchema);
