const axios = require("axios");
const NOTIF_DB = "http://localhost:5000/api/notifications";

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
  const { message, userId } = req.body;
  try {
    const response = await axios.post(NOTIF_DB, {
      user_id: userId,
      message
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
