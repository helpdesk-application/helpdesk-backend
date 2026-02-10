const axios = require("axios");
const REPLIES_API = process.env.DB_API + "replies";
const TICKETS_API = process.env.DB_API + "tickets";
const NOTIF_API = process.env.DB_API + "notifications"; // Database service URL for notifications

const createNotification = async (userId, message, ticketId) => {
    try {
        // We use the gateway URL to ensure it passes through the notification controller logic if needed
        await axios.post(NOTIF_API, { userId, message, ticketId });
    } catch (err) {
        console.error("[ReplyController] Failed to trigger notification:", err.message);
    }
};

exports.getReplies = async (req, res) => {
    const { id } = req.params; // ticketId
    try {
        const response = await axios.get(`${REPLIES_API}/ticket/${id}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createReply = async (req, res) => {
    const { id } = req.params; // ticketId
    const { message, is_internal } = req.body;
    const user_id = req.user.id;
    const user_role = req.user.role;

    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    try {
        // 1. Save the reply
        const response = await axios.post(REPLIES_API, {
            ticket_id: id,
            user_id,
            message,
            is_internal: is_internal || false
        });

        // 2. Fetch ticket details to find recipients
        const ticketRes = await axios.get(`${TICKETS_API}/${id}`);
        const ticket = ticketRes.data;

        // 3. Trigger Notifications
        const isStaff = ["Admin", "Super Admin", "Manager", "Agent"].includes(user_role);

        if (isStaff) {
            // Staff replied -> Notify Customer (only if not internal)
            if (!is_internal && ticket.customer_id) {
                const customerId = ticket.customer_id._id || ticket.customer_id;
                await createNotification(customerId, `New reply on your ticket: ${ticket.subject}`, id);
            }
        } else {
            // Customer replied -> Notify Assigned Agent (if any)
            if (ticket.assigned_agent_id) {
                const agentId = ticket.assigned_agent_id._id || ticket.assigned_agent_id;
                await createNotification(agentId, `Customer replied to ticket: ${ticket.subject}`, id);
            }
        }

        res.status(201).json(response.data);
    } catch (err) {
        console.error("[ReplyController] Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
