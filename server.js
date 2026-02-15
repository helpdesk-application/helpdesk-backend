const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const authRoutes = require("./01-auth/auth.routes");
const userRoutes = require("./02-users/user.routes");
const ticketRoutes = require("./03-tickets/ticket.routes");
const slaRoutes = require("./05-sla/sla.routes");
const notificationRoutes = require("./06-notifications/notification.routes");
const kbRoutes = require("./07-kb/kb.routes");
const reportRoutes = require("./08-reports/report.routes");
const adminRoutes = require("./admin/admin.routes"); // Admin doesn't have a numbered module yet, but falls under 01-auth/02-users scope.
const attachmentRoutes = require("./04-attachments/attachment.routes");
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Enable CORS so the frontend (vite) can call this backend
app.use(cors({
  origin: true,
  credentials: true,
}));

// Public routes
app.get("/", (req, res) => res.send("Helpdesk Backend Running"));
app.use("/auth", authRoutes);

// Protect all other routes by default
const { authorize } = require("./01-auth/auth.middleware");
app.use(authorize());

// Protected routes
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/sla", slaRoutes);
app.use("/notifications", notificationRoutes);
app.use("/kb", kbRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);
app.use("/attachments", attachmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("\n========================================");
  console.log("  Backend Server Started");
  console.log("========================================");
  console.log("Server running");
  console.log("\nAvailable routes:");
  console.log("  POST   /auth/login");
  console.log("  POST   /auth/register");
  console.log("  GET    /tickets");
  console.log("  POST   /tickets");
  console.log("  GET    /notifications");
  console.log("  POST   /notifications");
  console.log("=========================================\n");
});