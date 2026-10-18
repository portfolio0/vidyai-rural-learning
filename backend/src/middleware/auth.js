const jwt = require("jsonwebtoken");

// Hard protect — 401 if no/invalid token
const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Soft protect — sets req.user if token present, continues anyway
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    } catch {
      /* invalid token — just skip, req.user stays undefined */
    }
  }
  next();
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ error: "Access denied" });
    next();
  };

module.exports = { protect, optionalAuth, requireRole };
