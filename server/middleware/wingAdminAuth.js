// middleware/wingAdminAuth.js
import jwt from "jsonwebtoken";
import WingAdmin from "../models/wingAdminModel.js";

export const protectWingAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.wingAdmin = await WingAdmin.findById(decoded.id).populate("wing");
    next();
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
};
