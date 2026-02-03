const axios = require("axios");
const bcrypt = require("bcryptjs");

const DB_API = "http://localhost:5000/api/users";

exports.createUser = async (req, res) => {
  const { email, password, role, department, name } = req.body;
  // Note: Database service now handles "User already exists" check.

  // Forward to DB service
  try {
    const hashed = await bcrypt.hash(password, 10);
    const response = await axios.post(DB_API, {
      email,
      password: hashed, // Send hashed password
      role,
      department,
      name: name || email.split('@')[0] // default name if missing
    });
    res.status(201).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.getUsers = async (req, res) => {
  try {
    const response = await axios.get(DB_API);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role, department } = req.body;

  try {
    const response = await axios.patch(`${DB_API}/${id}`, { email, role, department });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.changeStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.patch(`${DB_API}/${id}/status`);
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const response = await axios.patch(`${DB_API}/${id}/password`, { password: hashed });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.delete(`${DB_API}/${id}`);
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
