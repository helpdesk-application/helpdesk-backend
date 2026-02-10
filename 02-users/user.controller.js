const axios = require("axios");
const bcrypt = require("bcryptjs");

const DB_API = process.env.DB_API + "users";

exports.getProfile = async (req, res) => {

  try {
    const response = await axios.get(`${DB_API}/${req.user.id}`);

    res.json(response.data);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, password } = req.body;
  const updates = { name };

  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }

  try {
    const response = await axios.patch(`${DB_API}/${req.user.id}`, updates);

    // Log Activity
    try {
      const clientIp = req.ip === '::1' ? '127.0.0.1' : req.ip;
      await axios.post(DB_API + "activities", {
        user_id: req.user.id,
        action: "ProfileUpdated",
        description: `User ${req.user.name || req.user.email} updated their profile`,
        ip_address: clientIp
      });
    } catch (logErr) {
      console.error("[UserController] Failed to log activity:", logErr.message);
    }

    res.json(response.data);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ message: "Server error" });
  }
};

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
    let users = response.data;

    // Department Isolation
    if (req.user.role === 'Manager' || req.user.role === 'Agent') {
      users = users.filter(u => u.department === req.user.department);
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role, department, password } = req.body;

  try {
    // Role Hierarchy: Check if target is Super Admin
    if (req.user.role === 'Admin') {
      const checkRes = await axios.get(`${DB_API}/${id}`);
      if (checkRes.data.role === 'Super Admin') {
        return res.status(403).json({ message: "Admin cannot modify Super Admin" });
      }
    }

    const updates = { email, role, department };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    const response = await axios.patch(`${DB_API}/${id}`, updates);
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
    // Role Hierarchy: Check if target is Super Admin
    if (req.user.role === 'Admin') {
      const checkRes = await axios.get(`${DB_API}/${id}`);
      if (checkRes.data.role === 'Super Admin') {
        return res.status(403).json({ message: "Admin cannot delete Super Admin" });
      }
    }

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

exports.getActivities = async (req, res) => {
  try {
    const response = await axios.get(`${DB_API}/activities/user/${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
