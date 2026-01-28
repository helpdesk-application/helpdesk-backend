const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { authorize } = require("../auth/auth.middleware");

// Admin and Agent can view/create notifications
router.get("/", authorize(["Admin", "Agent"]), notificationController.getNotifications);
router.post("/", authorize(["Admin", "Agent"]), notificationController.createNotification);

module.exports = router;
