const axios = require("axios");
const aiService = require("../utils/aiService");
const DB_API = process.env.DB_API + "tickets";
const NOTIF_API = process.env.DB_API + "notifications";
const USER_API = process.env.DB_API + "users";

const createNotification = async (userId, message, ticketId) => {
  try {
    await axios.post(NOTIF_API, { user_id: userId, message, ticket_id: ticketId });
  } catch (err) {
    console.error(`[TicketController] Failed to trigger notification for user ${userId} to ${NOTIF_API}:`, err.message);
  }
};

const deptMapping = {
  Billing: 'Finance',
  Technical: 'IT Support',
  Security: 'Security',
  General: 'General'
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const customer_id = req.user?.id;
    console.log(`[TicketController] Creating ticket for user: ${customer_id} (${req.user?.name || req.user?.email})`);

    // AI ANALYSIS (formerly ZIA)
    const analysis = aiService.analyzeTicket(`${subject} ${description}`);
    const routedDept = deptMapping[analysis.suggestedCategory] || 'General';
    console.log(`[TicketController] AI Analysis complete. Category: ${analysis.suggestedCategory}, Routed Dept: ${routedDept}`);

    // Auto-Assignment Logic (Round-Robin simple version)
    let assigned_agent_id = null;
    try {
      console.log(`[TicketController] Fetching agents from ${USER_API}...`);
      const agentsRes = await axios.get(USER_API);
      const activeAgents = agentsRes.data.filter(u =>
        u.role === 'Agent' &&
        u.department === routedDept &&
        u.status === 'ACTIVE'
      );

      console.log(`[TicketController] Found ${activeAgents.length} active agents for department ${routedDept}`);

      if (activeAgents.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeAgents.length);
        assigned_agent_id = activeAgents[randomIndex]._id;
        console.log(`[TicketController] Auto-assigned to agent: ${assigned_agent_id}`);
      }
    } catch (err) {
      console.error("[TicketController] Failed to fetch agents for auto-assignment:", err.message);
    }

    console.log(`[TicketController] Posting to DB Service: ${DB_API}...`);
    const response = await axios.post(DB_API, {
      subject,
      description,
      priority: priority || analysis.suggestedPriority || "MEDIUM",
      customer_id,
      assigned_agent_id,
      department: routedDept,
      category: analysis.suggestedCategory,
      sentiment: analysis.sentiment,
      user_name: req.user.name || req.user.email
    });
    const ticket = response.data.ticket;
    console.log(`[TicketController] Ticket saved in DB. UUID: ${ticket._id}`);

    // Notify Customer
    console.log(`[TicketController] Triggering customer notification...`);
    await createNotification(customer_id, `Ticket created: ${subject}. Routed to ${routedDept}.`, ticket._id);

    // Notify Agent if assigned
    if (assigned_agent_id) {
      console.log(`[TicketController] Triggering agent notification...`);
      await createNotification(assigned_agent_id, `New ticket auto-assigned: ${subject}`, ticket._id);
    }

    console.log(`[TicketController] Ticket creation complete!`);
    res.status(201).json(response.data);
  } catch (err) {
    console.error(`[TicketController] FATAL ERROR in createTicket:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let url = DB_API;

    // Filter based on role
    if (role === "Customer") {
      url = `${DB_API}/customer/${userId}`;
    } else if (role === "Agent") {
      url = `${DB_API}/agent/${userId}`;
    }

    const response = await axios.get(url);
    let tickets = response.data;

    // Department Isolation
    if (role === "Manager" || role === "Agent") {
      tickets = tickets.filter(t => t.department === req.user.department);
    }

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, priority, status, happiness_rating, customer_feedback, time_spent_minutes } = req.body;

    // Include user context for history logging in DB service
    const response = await axios.patch(`${DB_API}/${id}`, {
      subject, description, priority, status,
      happiness_rating, customer_feedback, time_spent_minutes,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email
    });

    const ticket = response.data.ticket;
    if (status) {
      await createNotification(ticket.customer_id, `Your ticket "${ticket.subject}" is now ${status}`, ticket._id);
    }

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const response = await axios.patch(`${DB_API}/${id}`, {
      status,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email
    });

    const ticket = response.data.ticket;
    await createNotification(ticket.customer_id, `Status update: ${ticket.subject} is now ${status}`, ticket._id);

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_agent_id } = req.body;

    // Fetch current ticket to check existing assignment
    const currentRes = await axios.get(`${DB_API}/${id}`);
    const currentTicket = currentRes.data;

    // If already assigned to the same agent, ignore
    if (String(currentTicket.assigned_agent_id?._id || currentTicket.assigned_agent_id) === String(assigned_agent_id)) {
      return res.json({ message: "Agent already assigned", ticket: currentTicket });
    }

    const response = await axios.patch(`${DB_API}/${id}`, {
      assigned_agent_id,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email
    });

    const ticket = response.data.ticket;
    await createNotification(assigned_agent_id, `New ticket assigned: ${ticket.subject}`, ticket._id);

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${DB_API}/${id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${DB_API}/${id}/history`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
