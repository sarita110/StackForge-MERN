export default function requireAdmin(req, res, next) {
  // Guard requires an active authenticated user with is_admin set to true
  if (!req.user || !req.user.is_admin) {
    return res
      .status(403)
      .json({ message: "Access Denied: Administrator privileges required." });
  }
  next();
}
