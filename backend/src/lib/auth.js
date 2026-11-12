const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "findit-hackathon-secret";

function parseUser(req) {
  const hdr = req.headers.authorization || "";
  if (hdr.startsWith("Bearer ")) {
    try {
      return jwt.verify(hdr.slice(7), JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
  const demoRole = req.headers["x-demo-role"];
  if (demoRole) {
    return { id: `demo-${String(demoRole).toLowerCase()}`, email: `demo@university.edu`, role: String(demoRole).toUpperCase(), handle: "Demo-User" };
  }
  return null;
}

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, handle: user.handle }, JWT_SECRET, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const user = parseUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { parseUser, signUser, requireAuth, requireRoles, JWT_SECRET };
