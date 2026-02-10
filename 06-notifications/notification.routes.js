const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { authorize } = require("../01-auth/auth.middleware");

// All authenticated users can view/mark their own notifications
router.get("/", notificationController.getNotifications);
router.post("/", authorize(["Admin", "Super Admin", "Agent", "Manager"]), notificationController.createNotification);
router.patch("/:id/read", authorize(), notificationController.markAsRead);

module.exports = router;
