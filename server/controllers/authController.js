import User from "../models/User.js";
import Resident from "../models/Resident.js";
import WingAdmin from "../models/wingAdminModel.js";
import Staff from "../models/Staff.js";
import DemoUser from "../models/DemoUser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/notifications.js";

const OTP_EXPIRY_MINUTES = 10;
const GUARD_STAFF_ROLES = ["guard", "security"];
const ACTIVE_STAFF_STATUS = "active";
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "token";

const getAuthCookieOptions = () => {
  const secure =
    process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
};

const findAccountByEmail = async (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

  console.log("Email:", normalizedEmail);
  console.log("Email Regex:", emailRegex);

  let account = await User.findOne({ email: { $regex: emailRegex } });
  if (!account){
    account = await Resident.findOne({
      email: { $regex: emailRegex },
      isDeleted: false,
    });
    if (account) return account;
    else{
      account = await WingAdmin.findOne({ email: { $regex: emailRegex } });
      return account;
    }
  }
  else{
    return account;
  }

};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      data: {
        id: user._id,
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        societyId: user.societyId || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!username || !email) {
      return res.status(400).json({ message: "username and email are required" });
    }

    const normalizedUsername = String(username).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = phone ? String(phone).trim() : null;

    const duplicateChecks = [
      { username: normalizedUsername },
      { email: normalizedEmail },
    ];
    if (normalizedPhone) duplicateChecks.push({ phone: normalizedPhone });

    const duplicate = await User.findOne({
      _id: { $ne: user._id },
      $or: duplicateChecks,
    });

    if (duplicate) {
      return res.status(400).json({ message: "Username, email, or phone already in use" });
    }

    user.username = normalizedUsername;
    user.email = normalizedEmail;
    user.phone = normalizedPhone;

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(String(password), 10);
    }

    await user.save();

    // Optional: extend session cookie on profile update (sliding session)
    const tokenFromCookie = String(req.headers.cookie || "").includes(`${AUTH_COOKIE_NAME}=`);
    if (tokenFromCookie) {
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role || null,
          societyId: user.societyId || null,
          wingId: user.wing || null,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );
      const maxAgeMs = Number(process.env.AUTH_COOKIE_MAXAGE_MS || 7 * 24 * 60 * 60 * 1000);
      res.cookie(AUTH_COOKIE_NAME, token, { ...getAuthCookieOptions(), maxAge: maxAgeMs });
    }

    return res.status(200).json({
      data: {
        id: user._id,
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        societyId: user.societyId || null,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body; // allow email or username

  try {
    const loginKey = String(usernameOrEmail || "").trim();
    if (!loginKey || !password) {
      return res.status(400).json({ message: "usernameOrEmail and password are required" });
    }

    // Try to find admin/society user first
    let user = await User.findOne({
      $or: [{ username: loginKey }, { email: loginKey }],
    });
    let authRole = user?.role || null;

    // If not found, try Resident by email or phone
    if (!user) {
      user = await Resident.findOne({
        $or: [{ ownerName: loginKey }, { email: loginKey }, { phone: loginKey }],
        isDeleted: false,
      });
      if (user) authRole = "resident";
    }

    if (!user) {
      user = await WingAdmin.findOne({
        $or: [{ name: loginKey }, { email: loginKey }, { phone: loginKey }],
      });
      if (user) authRole = "wingadmin";
    }

    // Guard login from staff records: only active security staff can log in
    if (!user) {
      user = await Staff.findOne({
        $or: [{ name: loginKey }, { email: loginKey }, { phone: loginKey }],
        role: { $in: GUARD_STAFF_ROLES },
        status: ACTIVE_STAFF_STATUS,
      }).select("+password");
      if (user) authRole = "guard";
    }

    // Demo user login (society demo)
    if (!user) {
      user = await DemoUser.findOne({
        $or: [{ name: loginKey }, { email: loginKey }, { phone: loginKey }],
      }).select("+password");
      if (user) authRole = user.role || "society";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const passwordHash = user.password || user.passwordHash || user.guardPassword;
    if (!passwordHash) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Sign JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: authRole,
        societyId: user.societyId || null,
        wingId: user.wing || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Set httpOnly cookie so session survives refresh without client storage.
    const maxAgeMs = Number(process.env.AUTH_COOKIE_MAXAGE_MS || 7 * 24 * 60 * 60 * 1000);
    res.cookie(AUTH_COOKIE_NAME, token, { ...getAuthCookieOptions(), maxAge: maxAgeMs });

    // Return user info + token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username || user.ownerName || user.name,
        role: authRole,
        societyId: user.societyId || null,
        email: user.email || null,
        phone: user.phone || null,
        wingId: user.wing || null
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
  return res.status(200).json({ message: "Logged out" });
};

export const requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }



  try {
    const account = await findAccountByEmail(email);
  console.log("Account Email:", account);
    // Keep the same response for unknown emails to avoid account enumeration.
    if (!account) {
      return res.status(200).json({
        message: "If this email is registered, an OTP has been sent.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    account.resetPasswordOtp = otpHash;
    account.resetPasswordOtpExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    await account.save({ validateBeforeSave: false });

    await sendEmail({
      to: String(email).trim().toLowerCase(),
      subject: "RGMS Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    return res.status(200).json({
      message: "If this email is registered, an OTP has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const account = await findAccountByEmail(email);

    if (
      !account ||
      !account.resetPasswordOtp ||
      !account.resetPasswordOtpExpiry ||
      account.resetPasswordOtpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcrypt.compare(otp, account.resetPasswordOtp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const account = await findAccountByEmail(email);

    if (
      !account ||
      !account.resetPasswordOtp ||
      !account.resetPasswordOtpExpiry ||
      account.resetPasswordOtpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcrypt.compare(otp, account.resetPasswordOtp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (account.constructor.modelName === "User") {
      account.password = await bcrypt.hash(newPassword, 10);
    } else {
      account.password = newPassword;
    }

    account.resetPasswordOtp = undefined;
    account.resetPasswordOtpExpiry = undefined;

    await account.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
