const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const DB_API = "http://localhost:5000/api/users";
const SECRET = process.env.SECRET || "dev-secret";

exports.register = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is required" });
  }
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // Use the Users Module Logic via DB Service
  // Note: We need to hash before sending to DB Service because DB Service expects hashed password
  // OR we can use the same logic as user.controller.js:
  // actually, DB Service saves what it gets. user.controller.js hashes it.
  // So here specifically for register, we should match user.controller.js behavior.

  try {
    const hashed = await bcrypt.hash(password, 10);
    const response = await axios.post(DB_API, {
      email,
      password: hashed,
      role: role || "Customer",
      // Name not required by DB model strictly, but let's provide default
      name: email.split('@')[0],
      department: "General"
    });

    // DB Service returns user object. We need to generate token.
    const newUser = response.data.user;
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET, { expiresIn: "7d" });

    res.json({ message: "User registered", token, user: { id: newUser.id, email: newUser.email, role: newUser.role } });

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is required" });
  }
  const { email, password } = req.body;

  console.log('[AUTH] Login attempt for:', email);

  if (!email || !password) {
    console.log('[AUTH] Missing email or password');
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // 1. Fetch user from DB Service (using new endpoint)
    // We need to handle 404 manually here if axios throws on 404
    let user;
    try {
      const response = await axios.get(`${DB_API}/email/${email}`);
      user = response.data;
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log('[AUTH] User not found:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      throw e;
    }

    // 2. Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[AUTH] Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token
    // DB uses _id, but frontend might expect id. Let's map it.
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });

    console.log('[AUTH] ✅ Login successful for:', email);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ message: "Login failed system error" });
  }
};
