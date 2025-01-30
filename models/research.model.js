import mongoose from "mongoose";

const researchSchema = new mongoose.Schema({
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Influencer",
    required: true,
  },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },

  claimLimit: { type: Number, default: 50 },
  products: { type: Number },
  journals: [{ type: String }],
  notes: { type: String },
  trustScore: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Research = mongoose.model("Research", researchSchema);
