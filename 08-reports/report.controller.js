const axios = require("axios");

const REPORTS_DB = "http://localhost:5000/api/reports";

exports.getSummary = async (req, res) => {
  try {
    const [summaryRes, performanceRes] = await Promise.all([
      axios.get(`${REPORTS_DB}/dashboard-summary`),
      axios.get(`${REPORTS_DB}/tickets-by-agent-resolved`)
    ]);

    const summary = summaryRes.data;
    const performance = performanceRes.data;

    res.json({
      ...summary,
      avgResolutionTime: summary.avgResolutionTime,
      slaCompliance: summary.slaCompliance,
      performance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
