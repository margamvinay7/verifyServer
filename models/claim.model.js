import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Influencer",
    required: true,
  },
  tweet_id: { type: String, required: true },
  text: { type: String, required: true },
  category: {
    type: String,
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ["Verified", "Questionable", "Debunked"],
    required: true,
  },
  soruce: { type: String },
  aiAnalysis: { type: String },
  trustScore: { type: Number, min: 0, max: 100, required: true },
  journalsUsed: [{ type: String }],
  duplicate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Claim = mongoose.model("Claim", claimSchema);
