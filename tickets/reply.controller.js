const axios = require("axios");
const REPLIES_API = "http://localhost:5000/api/replies";

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

    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    try {
        const response = await axios.post(REPLIES_API, {
            ticket_id: id,
            user_id,
            message,
            is_internal: is_internal || false
        });
        res.status(201).json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
