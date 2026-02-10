const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { generateResetToken } = require("./auth.utils");

// In-memory store for reset tokens (since we don't have a DB schema for it yet)
// In production, this should be in Redis or the User DB model
const resetTokens = new Map(); // email -> { token, expires }

const DB_API = process.env.DB_API + "users";
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
      role: "Customer",
      // Name not required by DB model strictly, but let's provide default
      name: email.split('@')[0],
      department: "General"
    });

    // DB Service returns user object. We need to generate token.
    const newUser = response.data.user;
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET, { expiresIn: "7d" });

    res.json({ message: "User registered", token, user: { id: newUser.id, email: newUser.email, role: newUser.role } });

  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ message: "Login failed system error" });
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
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, SECRET, { expiresIn: "7d" });

    // 4. Log Activity
    try {
      const clientIp = req.ip === '::1' ? '127.0.0.1' : req.ip;
      await axios.post(process.env.DB_API + "users/activities", {
        user_id: user._id,
        action: "LoggedIn",
        description: `User logged in from ${clientIp}`,
        ip_address: clientIp
      });
    } catch (logErr) {
      console.error("[AUTH] Failed to log activity:", logErr.message);
    }

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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    // 1. Check if user exists (mock check via DB Service)
    try {
      await axios.get(`${DB_API}/email/${email}`);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        // Security: Don't reveal user doesn't exist
        // But for this project, let's just return success to avoid confusion or log it
        console.log(`[AUTH] Forgot Password: User ${email} not found.`);
        return res.json({ message: "If your email is registered, you will receive a reset link." });
      }
      throw e;
    }

    // 2. Generate Token
    const token = generateResetToken();
    const expires = Date.now() + 3600000; // 1 hour

    resetTokens.set(email, { token, expires });

    // 3. Mock Email Sending
    console.log("\n========================================");
    console.log(`[MOCK EMAIL] Password Reset Request for: ${email}`);
    console.log(`[MOCK EMAIL] Reset Token: ${token}`);
    console.log(`[MOCK EMAIL] Link: http://localhost:5173/reset-password?token=${token}&email=${email}`);
    console.log("========================================\n");

    res.json({ message: "If your email is registered, you will receive a reset link." });

  } catch (err) {
    console.error('[AUTH] Forgot Password error:', err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const record = resetTokens.get(email);

  if (!record || record.token !== token) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  if (Date.now() > record.expires) {
    resetTokens.delete(email);
    return res.status(400).json({ message: "Token expired" });
  }

  try {
    // 1. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Update in DB Service
    // We need to get the user ID first
    const userRes = await axios.get(`${DB_API}/email/${email}`);
    const userId = userRes.data._id;

    await axios.patch(`${DB_API}/${userId}/password`, { password: hashedPassword });

    // 3. Clear token
    resetTokens.delete(email);

    res.json({ message: "Password reset successful. Please login." });

  } catch (err) {
    console.error('[AUTH] Reset Password error:', err.message);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password required" });
  }

  try {
    // 1. Fetch user from DB Service to get current hashed password
    // Use /email/:email or a specialized fetch that includes password
    // The current /id/ endpoint excludes password.
    const currentUserRes = await axios.get(`${DB_API}/${userId}`);
    const email = currentUserRes.data.email;
    const userRes = await axios.get(`${DB_API}/email/${email}`);
    const user = userRes.data;

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    // 3. Hash new password
    const hashedNew = await bcrypt.hash(newPassword, 10);

    // 4. Update in DB Service
    await axios.patch(`${DB_API}/${userId}/password`, { password: hashedNew });

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error('[AUTH] Change Password error:', err.message);
    res.status(500).json({ message: "Failed to change password" });
  }
};
