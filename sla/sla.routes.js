const express = require("express");
const router = express.Router();
const slaController = require("./sla.controller");
const { authorize } = require("../auth/auth.middleware");

// Admin or Agent can trigger SLA check
router.post("/check", slaController.checkSLA);

module.exports = router;
