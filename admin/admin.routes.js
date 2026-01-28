const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { authorize } = require("../auth/auth.middleware");

// Admin-only routes
router.get("/dashboard", authorize(["Admin"]), adminController.getDashboard);
router.patch("/user/:id/role", authorize(["Admin"]), adminController.changeUserRole);
router.patch("/user/:id/toggle", authorize(["Admin"]), adminController.toggleUserStatus);

module.exports = router;
