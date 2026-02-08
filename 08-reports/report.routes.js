const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const { authorize } = require("../01-auth/auth.middleware");

// Admin, Super Admin and Manager access only
router.get("/summary", authorize(["Admin", "Super Admin", "Manager"]), reportController.getSummary);

module.exports = router;
