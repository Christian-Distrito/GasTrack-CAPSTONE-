import jwt from "jsonwebtoken";

// ---------------------------------------------------------------------------
// Protects a route — requires a valid "Authorization: Bearer <token>" header.
// Attaches the decoded payload (user_id, role, company_id) to req.user.
// ---------------------------------------------------------------------------

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---------------------------------------------------------------------------
// Restricts a route to specific roles, e.g. requireRole("Admin")
// Must be used AFTER requireAuth, since it reads req.user.role.
// ---------------------------------------------------------------------------

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission to do this" });
    }
    next();
  };
}