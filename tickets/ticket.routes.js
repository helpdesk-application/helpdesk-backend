const express = require("express");
const router = express.Router();
const ticketController = require("./ticket.controller");
const { authorize } = require("../auth/auth.middleware");

// Admin or Agent can create/view/update
router.post("/", authorize(["Admin", "Agent"]), ticketController.createTicket);
router.get("/", authorize(["Admin", "Agent"]), ticketController.getTickets);
router.put("/:id", authorize(["Admin", "Agent"]), ticketController.updateTicket);
router.patch("/:id/status", authorize(["Admin", "Agent"]), ticketController.changeStatus);
router.patch("/:id/assign", authorize(["Admin"]), ticketController.assignTicket);

module.exports = router;
