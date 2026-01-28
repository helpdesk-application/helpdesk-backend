const { readJSON, writeJSON } = require("../utils/fileHandler");

const NOTIF_FILE = "./notifications/notifications.json";

exports.getNotifications = (req, res) => {
  const notifications = readJSON(NOTIF_FILE);
  const userId = req.user.id;

  // Optional: filter by user
  const userNotifs = notifications.filter(n => n.userId === userId || n.userId === "all");
  res.json(userNotifs);
};

exports.createNotification = (req, res) => {
  const { message, userId } = req.body;
  const notifications = readJSON(NOTIF_FILE);

  const newNotif = {
    id: notifications.length + 1,
    message,
    userId: userId || "all", // "all" means broadcast
    createdAt: new Date().toISOString()
  };

  notifications.push(newNotif);
  writeJSON(NOTIF_FILE, notifications);
  res.json({ message: "Notification created", notification: newNotif });
};
