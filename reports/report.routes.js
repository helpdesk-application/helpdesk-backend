const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const { authorize } = require("../auth/auth.middleware");

// Admin-only access
router.get("/summary", authorize(["Admin"]), reportController.getSummary);

module.exports = router;
