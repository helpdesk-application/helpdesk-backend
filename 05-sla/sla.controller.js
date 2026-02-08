const axios = require("axios");
const { hoursBetween } = require("../utils/timeUtils");

const TICKETS_API = "http://localhost:5000/api/tickets";
const NOTIF_API = "http://localhost:5000/api/notifications";

// SLA rules (in hours)
const SLA_RULES = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72
};

const createNotification = async (userId, message) => {
  try {
    await axios.post(NOTIF_API, { user_id: userId, message });
  } catch (err) {
    console.error("Failed to trigger notification:", err.message);
  }
};

exports.checkSLA = async (req, res) => {
  try {
    const response = await axios.get(TICKETS_API);
    const tickets = response.data;
    const now = new Date();
    const updatedTickets = [];

    for (const ticket of tickets) {
      // Don't check resolved/closed tickets
      if (!["RESOLVED", "CLOSED"].includes(ticket.status?.toUpperCase())) {
        const slaLimit = SLA_RULES[ticket.priority?.toUpperCase()] || 48;
        const age = hoursBetween(ticket.created_at, now);

        if (age > slaLimit && ticket.status?.toUpperCase() !== "ESCALATED") {
          // Update ticket status to Escalated in DB
          try {
            const updateRes = await axios.patch(`${TICKETS_API}/${ticket._id}`, {
              status: "ESCALATED",
              user_id: 'SYSTEM',
              user_name: 'SLA Engine'
            });
            const updatedTicket = updateRes.data.ticket;
            updatedTickets.push(updatedTicket);

            // Notify Agent
            if (updatedTicket.assigned_agent_id) {
              await createNotification(updatedTicket.assigned_agent_id, `URGENT: Ticket "${updatedTicket.subject}" has breached SLA!`);
            }

            // ESCALATION: Notify all Admins
            try {
              const USERS_API = "http://localhost:5000/api/users";
              const usersRes = await axios.get(USERS_API);
              const admins = usersRes.data.filter(u => u.role === 'Admin' || u.role === 'Super Admin');
              for (const admin of admins) {
                await createNotification(admin._id, `ESCALATION: Ticket "${updatedTicket.subject}" (ID: ${updatedTicket._id}) has breached SLA and requires attention.`);
              }
            } catch (escErr) {
              console.error("Failed to notify admins during escalation:", escErr.message);
            }

            // LOG SLA BREACH TO DB SERVICE
            try {
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
