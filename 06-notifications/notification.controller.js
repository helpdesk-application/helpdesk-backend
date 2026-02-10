const axios = require("axios");
const NOTIF_DB = process.env.DB_API + "notifications";

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const response = await axios.get(`${NOTIF_DB}/user/${userId}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  const { message, userId, ticketId } = req.body;
  try {
    const response = await axios.post(NOTIF_DB, {
      user_id: userId,
      message,
      ticket_id: ticketId
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.patch(`${NOTIF_DB}/${id}/read`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
