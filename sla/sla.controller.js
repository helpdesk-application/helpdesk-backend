const axios = require("axios");
const { hoursBetween } = require("../utils/timeUtils");

const TICKETS_API = "http://localhost:5000/api/tickets";

// SLA rules (in hours)
const SLA_RULES = {
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72
};

exports.checkSLA = async (req, res) => {
  try {
    const response = await axios.get(TICKETS_API);
    const tickets = response.data;
    const now = new Date();
    const updatedTickets = [];

    for (const ticket of tickets) {
      if (ticket.status !== "Resolved" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && ticket.status !== "Closed") {
        const slaLimit = SLA_RULES[ticket.priority] || 48;
        const age = hoursBetween(ticket.created_at, now);

        if (age > slaLimit && ticket.status !== "Escalated" && ticket.status !== "ESCALATED") {
          // Update ticket status to Escalated in DB
          try {
            const updateRes = await axios.patch(`${TICKETS_API}/${ticket._id}`, {
              status: "ESCALATED"
            });
            updatedTickets.push(updateRes.data.ticket);

            // LOG SLA BREACH TO DB SERVICE
            try {
              // Assuming DB service is on port 5000 (based on TICKETS_API)
              // But TICKETS_API is using localhost:5000 which IS the DB service.
              // So we can use the same base URL.
              const DB_SERVICE_URL = "http://localhost:5000/api/sla/tracking";
              await axios.post(DB_SERVICE_URL, {
                ticket_id: ticket._id,
                priority: ticket.priority,
                created_at: ticket.created_at,
                breached: true
              });
              console.log(`Logged SLA breach for ticket ${ticket._id}`);
            } catch (logErr) {
              console.error(`Failed to log SLA breach for ${ticket._id}:`, logErr.message);
            }

          } catch (e) {
            console.error(`Failed to escalate ticket ${ticket._id}:`, e.message);
          }
        }
      }
    }

    res.json({ message: "SLA check complete", escalatedCount: updatedTickets.length, escalatedTickets: updatedTickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
