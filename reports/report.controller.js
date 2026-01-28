const { readJSON } = require("../utils/fileHandler");

const TICKETS_FILE = "./tickets/tickets.json";

exports.getSummary = (req, res) => {
  const tickets = readJSON(TICKETS_FILE);

  const summary = {
    totalTickets: tickets.length,
    byStatus: {},
    byPriority: {},
    byAgent: {},
    escalatedCount: 0
  };

  tickets.forEach(ticket => {
    // Count by status
    summary.byStatus[ticket.status] = (summary.byStatus[ticket.status] || 0) + 1;

    // Count by priority
    summary.byPriority[ticket.priority] = (summary.byPriority[ticket.priority] || 0) + 1;

    // Count by agent
    if (ticket.assignedTo) {
      summary.byAgent[ticket.assignedTo] = (summary.byAgent[ticket.assignedTo] || 0) + 1;
    }

    // Escalated count
    if (ticket.status === "Escalated") {
      summary.escalatedCount++;
    }
  });

  res.json(summary);
};
