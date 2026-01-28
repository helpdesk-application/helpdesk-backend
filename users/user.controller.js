const bcrypt = require("bcryptjs");
const { readJSON, writeJSON } = require("../utils/fileHandler");

const USERS_FILE = "./users/users.json";

exports.createUser = async (req, res) => {
  const { email, password, role } = req.body;
  const users = readJSON(USERS_FILE);

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    email,
    password: hashed,
    role,
    status: "Active"
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);
  res.json({ message: "User created", user: { id: newUser.id, email, role } });
};

exports.getUsers = async (req, res) => {
  const users = readJSON(USERS_FILE);
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id == id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.email = email || user.email;
  user.role = role || user.role;

  writeJSON(USERS_FILE, users);
  res.json({ message: "User updated", user });
};

exports.changeStatus = async (req, res) => {
  const { id } = req.params;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id == id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = user.status === "Active" ? "Inactive" : "Active";
  writeJSON(USERS_FILE, users);
  res.json({ message: `User status changed to ${user.status}` });
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id == id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await bcrypt.hash(newPassword, 10);
  writeJSON(USERS_FILE, users);
  res.json({ message: "Password reset successfully" });
};
