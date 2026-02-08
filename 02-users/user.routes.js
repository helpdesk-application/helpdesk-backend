const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { authorize } = require("../01-auth/auth.middleware");

// Self-management
router.get("/me", authorize(), userController.getProfile);
router.patch("/me", authorize(), userController.updateProfile);

// Admin-only routes
router.post("/", authorize(["Admin", "Super Admin"]), userController.createUser);
router.get("/", authorize(["Admin", "Super Admin", "Manager"]), userController.getUsers);
router.patch("/:id", authorize(["Admin", "Super Admin"]), userController.updateUser);
router.patch("/:id/status", authorize(["Admin", "Super Admin"]), userController.changeStatus);
router.post("/:id/reset-password", authorize(["Admin", "Super Admin"]), userController.resetPassword);

router.delete("/:id", authorize(["Admin", "Super Admin"]), userController.deleteUser);

// Activity logs
router.get("/activities", authorize(), userController.getActivities);

module.exports = router;
