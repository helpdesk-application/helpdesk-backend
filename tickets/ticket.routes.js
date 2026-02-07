const express = require("express");
const router = express.Router();
const ticketController = require("./ticket.controller");
const { authorize } = require("../auth/auth.middleware");

// Customer can create tickets, all roles can view their own tickets
router.post("/", authorize(["Admin", "Agent", "Customer", "Super Admin"]), ticketController.createTicket);
router.get("/", authorize(["Admin", "Agent", "Customer", "Super Admin"]), ticketController.getTickets);
router.get("/:id", authorize(["Admin", "Agent", "Customer", "Super Admin"]), ticketController.getTicketById);
// Only Admin or Agent can update/manage tickets
router.patch("/:id", authorize(["Admin", "Agent", "Super Admin"]), ticketController.updateTicket);
router.patch("/:id/status", authorize(["Admin", "Agent", "Super Admin"]), ticketController.changeStatus);
router.patch("/:id/assign", authorize(["Admin", "Super Admin"]), ticketController.assignTicket);

// Reply routes
const replyController = require("./reply.controller");
router.get("/:id/replies", authorize(["Admin", "Agent", "Customer", "Super Admin"]), replyController.getReplies);
router.post("/:id/replies", authorize(["Admin", "Agent", "Customer", "Super Admin"]), replyController.createReply);

module.exports = router;
