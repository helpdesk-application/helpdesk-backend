const axios = require("axios");

const REPORTS_DB = process.env.DB_API + "reports";

exports.getSummary = async (req, res) => {
  const { range = 'monthly' } = req.query;
  try {
    const { role, department } = req.user;
    const deptQuery = (role === 'Manager' || role === 'Agent') ? `&department=${encodeURIComponent(department)}` : '';

    const [summaryRes, performanceRes] = await Promise.all([
      axios.get(`${REPORTS_DB}/dashboard-summary?range=${range}${deptQuery}`),
      axios.get(`${REPORTS_DB}/tickets-by-agent-resolved?range=${range}${deptQuery}`)
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
