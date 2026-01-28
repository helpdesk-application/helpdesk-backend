const express = require("express");
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

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/sla", slaRoutes);
app.use("/notifications", notificationRoutes);
app.use("/kb", kbRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => res.send("Helpdesk Backend Running"));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
