const express = require("express");
const router = express.Router();
const slaController = require("./sla.controller");
const { authorize } = require("../01-auth/auth.middleware");

// Admin, Agent or Manager can trigger SLA check
router.post("/check", authorize(["Admin", "Super Admin", "Agent", "Manager"]), slaController.checkSLA);

module.exports = router;
