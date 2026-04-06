import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Resident from "../models/Resident.js";
import wingAdmin from "../models/wingAdminModel.js";
import Staff from "../models/Staff.js";
import DemoUser from "../models/DemoUser.js";
import Audit from "../models/Audit.js";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "token";

const AUDIT_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const getAuditModelFromPath = (path = "") => {
  const normalized = String(path).split("?")[0].replace(/^\/api\//, "");
  const [resource = "unknown"] = normalized.split("/");
  return resource
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

const getActorName = (user) =>
  user?.username || user?.ownerName || user?.name || user?.email || "Unknown";

const readCookie = (cookieHeader = "", name) => {
  const header = String(cookieHeader || "");
  if (!header) return null;

  const parts = header.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    if (key !== name) continue;
    return trimmed.slice(eqIndex + 1);
  }

  return null;
};

// Protect routes
export const protect = async (req, res, next) => {

  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = readCookie(req.headers.cookie, AUTH_COOKIE_NAME) || readCookie(req.headers.cookie, "token");
    }

    if (token) {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Decoded:", decoded);

      /* Fetch full user from DB */
      let user = await User.findById(decoded.id).select("-password");

      if (!user) {
        user = await wingAdmin.findById(decoded.id).select("-password");
      }
      if (!user) {
        user = await Resident.findById(decoded.id).select("-password");
      }
      if (!user) {
        user = await Staff.findById(decoded.id).select("-password");
      }
      if (!user) {
        user = await DemoUser.findById(decoded.id).select("-password");
      }
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      /* Attach full user */
      req.user = user;

      if (!res.locals.__auditAttached) {
        res.locals.__auditAttached = true;
        res.on("finish", async () => {
          try {
            if (!AUDIT_METHODS.has(req.method)) return;
            if (!req.user?._id) return;

            const endpoint = req.originalUrl?.split("?")[0] || req.path;
            const model = getAuditModelFromPath(endpoint);
            const role = String(req.user.role || "").toLowerCase();

            await Audit.create({
              action: `${req.method}_${res.statusCode < 400 ? "SUCCESS" : "FAILED"}`,
              model,
              recordName: endpoint,
              performedBy: req.user._id,
              performedByName: getActorName(req.user),
              performedByRole: role,
              societyId: req.user.societyId || null,
              endpoint,
              method: req.method,
              statusCode: res.statusCode,
            });
          } catch (auditErr) {
            console.error("Auto audit log failed:", auditErr.message);
          }
        });
      }

      console.log("Role:", req.user.role);
      console.log("Society:", req.user.society);

      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (err) {
    console.error("Protect middleware error:", err);
    res.status(401).json({ message: "Not authorized" });
  }
};

// Role-based access
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    const normalizedRoles = roles.map((role) => String(role).toLowerCase());
    console.log(roles);
    console.log(req.user.role);
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!normalizedRoles.includes(req.user.role?.toLowerCase()))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
};
