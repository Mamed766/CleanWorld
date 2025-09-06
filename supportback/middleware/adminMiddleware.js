const jwt = require("jsonwebtoken");
const { Role } = require("../models/role");

const adminMiddleware = (options = {}) => {
  const { roles = [], permissions = [] } = options;

  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    try {
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      req.admin = decoded;

      if (!decoded.role) {
        return res.status(403).json({ message: "Admin has no role" });
      }

      const role = await Role.findById(decoded.role);
      if (!role) return res.status(403).json({ message: "Role not found" });

      // Rol kontrolü
      if (roles.length > 0 && !roles.includes(role.name)) {
        return res.status(403).json({ message: "Role not allowed" });
      }

      // Permission kontrolü
      if (permissions.length > 0) {
        const hasPermission = permissions.every((perm) =>
          role.permissions.includes(perm)
        );

        if (!hasPermission) {
          return res.status(403).json({ message: "Permission denied" });
        }
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
module.exports = { adminMiddleware };
