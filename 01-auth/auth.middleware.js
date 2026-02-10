const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET || "dev-secret";

function authorize(roles = []) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });

    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, SECRET);
      console.log(`[AUTH-MIDDLEWARE] Request: ${req.method} ${req.originalUrl}, Role: ${decoded.role}, Allowed: ${roles}`);
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
