const express = require("express");
const cors = require("cors");
const authRoutes = require("./auth/auth.routes");
const userRoutes = require("./users/user.routes"); // ✅ Add this line
const ticketRoutes = require("./tickets/ticket.routes");
const slaRoutes = require("./sla/sla.routes");
const notificationRoutes = require("./notifications/notification.routes");
const kbRoutes = require("./knowledge/kb.routes");
const reportRoutes = require("./reports/report.routes");
const adminRoutes = require("./admin/admin.routes");

const app = express();
app.use(express.json());
// Enable CORS so the frontend (vite) can call this backend
app.use(cors());

// Public routes
app.use("/auth", authRoutes);

// Protect all other routes by default
const { authorize } = require("./auth/auth.middleware");
app.use(authorize());

// Protected routes
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/sla", slaRoutes);
app.use("/notifications", notificationRoutes);
app.use("/kb", kbRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => res.send("Helpdesk Backend Running"));

app.listen(3001, () => {
  console.log("\n========================================");
  console.log("  Backend Server Started");
  console.log("========================================");
  console.log("Server running on http://localhost:3001");
  console.log("\nAvailable routes:");
  console.log("  POST   /auth/login");
  console.log("  POST   /auth/register");
  console.log("  GET    /tickets");
  console.log("  POST   /tickets");
  console.log("  GET    /notifications");
  console.log("  POST   /notifications");
  console.log("=========================================\n");
});
