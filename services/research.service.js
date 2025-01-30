import { Research } from "../models/research.model.js";

export const calculateDateRange = (timePeriod) => {
  const endDate = new Date();
  let startDate;

  switch (timePeriod) {
    case "Last Week":
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "lastmonth":
      startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case "lastyear":
      startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case "alltime":
      startDate = new Date(0);
      break;
    default:
      throw new Error("Invalid time period");
  }

  return { startDate, endDate };
};

export const createResearchService = async (data) => {
  const { influencerId, claimLimit, products, journals, notes, dateRange } =
    data;

  if (!dateRange?.startDate || !dateRange?.endDate) {
    throw new Error("Invalid date range");
  }

  const research = await Research.create({
    influencerId: influencerId,
    dateRange,
    claimLimit,
    products,
    journals,
    notes,
  });

  return research;
};
