import { getAnalyticsService } from "../services/analytics.service.js";

export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsService();
    res.status(200).json({ success: true, data: analyticsData });
  } catch (error) {
    // console.error("Error fetching analytics data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
