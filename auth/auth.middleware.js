const jwt = require("jsonwebtoken");
const SECRET = "supersecretkey";

function authorize(roles = []) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });

    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports = { authorize };
