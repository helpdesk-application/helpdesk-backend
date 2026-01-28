const { readJSON, writeJSON } = require("../utils/fileHandler");

const USERS_FILE = "./users/users.json";
const TICKETS_FILE = "./tickets/tickets.json";

exports.getDashboard = (req, res) => {
  const users = readJSON(USERS_FILE);
  const tickets = readJSON(TICKETS_FILE);

  const dashboard = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "Active").length,
    inactiveUsers: users.filter(u => u.status === "Inactive").length,
    totalTickets: tickets.length,
    escalatedTickets: tickets.filter(t => t.status === "Escalated").length
  };

  res.json(dashboard);
};

exports.changeUserRole = (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id == id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = newRole;
  writeJSON(USERS_FILE, users);
  res.json({ message: `User role changed to ${newRole}` });
};

exports.toggleUserStatus = (req, res) => {
  const { id } = req.params;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id == id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = user.status === "Active" ? "Inactive" : "Active";
  writeJSON(USERS_FILE, users);
  res.json({ message: `User status changed to ${user.status}` });
};
