const express = require("express");
const router = express.Router();
const ticketController = require("./ticket.controller");
const { authorize } = require("../01-auth/auth.middleware");

// Customer can create tickets, all roles can view their own tickets
router.post("/", authorize(["Admin", "Agent", "Customer", "Super Admin", "Manager"]), ticketController.createTicket);
router.get("/", authorize(["Admin", "Agent", "Customer", "Super Admin", "Manager"]), ticketController.getTickets);
router.get("/:id", authorize(["Admin", "Agent", "Customer", "Super Admin", "Manager"]), ticketController.getTicketById);
// Only Admin, Agent, or Manager can update/manage tickets
router.patch("/:id", authorize(["Admin", "Agent", "Super Admin", "Manager"]), ticketController.updateTicket);
router.patch("/:id/status", authorize(["Admin", "Agent", "Super Admin", "Manager"]), ticketController.changeStatus);
router.patch("/:id/assign", authorize(["Admin", "Super Admin", "Manager"]), ticketController.assignTicket);

// Reply routes
const replyController = require("./reply.controller");
router.get("/:id/replies", authorize(["Admin", "Agent", "Customer", "Super Admin", "Manager"]), replyController.getReplies);
router.post("/:id/replies", authorize(["Admin", "Agent", "Customer", "Super Admin", "Manager"]), replyController.createReply);

module.exports = router;
