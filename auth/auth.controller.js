const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readJSON, writeJSON } = require("../utils/fileHandler");

const USERS_FILE = "./auth/users.json";
const SECRET = "supersecretkey"; // Change this in production

exports.register = async (req, res) => {
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
  res.json({ message: "User registered", user: { id: newUser.id, email, role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};
