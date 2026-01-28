const { readJSON, writeJSON } = require("../utils/fileHandler");

const TICKETS_FILE = "./tickets/tickets.json";

exports.createTicket = (req, res) => {
  const { title, description, priority } = req.body;
  const tickets = readJSON(TICKETS_FILE);

  const newTicket = {
    id: tickets.length + 1,
    title,
    description,
    priority,
    status: "Open",
    createdAt: new Date().toISOString(),
    assignedTo: null
  };

  tickets.push(newTicket);
  writeJSON(TICKETS_FILE, tickets);
  res.json({ message: "Ticket created", ticket: newTicket });
};

exports.getTickets = (req, res) => {
  const tickets = readJSON(TICKETS_FILE);
  res.json(tickets);
};

exports.updateTicket = (req, res) => {
  const { id } = req.params;
  const { title, description, priority } = req.body;
  const tickets = readJSON(TICKETS_FILE);
  const ticket = tickets.find(t => t.id == id);

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  ticket.title = title || ticket.title;
  ticket.description = description || ticket.description;
  ticket.priority = priority || ticket.priority;

  writeJSON(TICKETS_FILE, tickets);
  res.json({ message: "Ticket updated", ticket });
};

exports.changeStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const tickets = readJSON(TICKETS_FILE);
  const ticket = tickets.find(t => t.id == id);

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  ticket.status = status;
  writeJSON(TICKETS_FILE, tickets);
  res.json({ message: `Status changed to ${status}` });
};

exports.assignTicket = (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;
  const tickets = readJSON(TICKETS_FILE);
  const ticket = tickets.find(t => t.id == id);

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  ticket.assignedTo = agentId;
  writeJSON(TICKETS_FILE, tickets);
  res.json({ message: `Ticket assigned to agent ${agentId}` });
};
