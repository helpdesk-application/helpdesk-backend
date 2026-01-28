const { readJSON, writeJSON } = require("../utils/fileHandler");
const { hoursBetween } = require("../utils/timeUtils");

const TICKETS_FILE = "./tickets/tickets.json";

// SLA rules (in hours)
const SLA_RULES = {
  High: 24,
  Medium: 48,
  Low: 72
};

exports.checkSLA = (req, res) => {
  const tickets = readJSON(TICKETS_FILE);
  const now = new Date();

  const updated = tickets.map(ticket => {
    if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
      const slaLimit = SLA_RULES[ticket.priority] || 48;
      const age = hoursBetween(ticket.createdAt, now);

      if (age > slaLimit && ticket.status !== "Escalated") {
        ticket.status = "Escalated";
        ticket.escalatedAt = now.toISOString();
      }
    }
    return ticket;
  });

  writeJSON(TICKETS_FILE, updated);
  res.json({ message: "SLA check complete", tickets: updated });
};
