const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
if (!SECRET) throw new Error('FATAL: SECRET environment variable is not set.');

function authorize(roles = []) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });

    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        console.warn(`[AUTH-MIDDLEWARE] 403 Forbidden for role: ${decoded.role}`);
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      console.error(`[AUTH-MIDDLEWARE] Token verification failed:`, err.message);
      res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports = { authorize };
