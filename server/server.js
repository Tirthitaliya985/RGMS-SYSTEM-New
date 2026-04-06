import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import societyRoutes from "./routes/societyRoutes.js";
import routes from "./routes/adminRoutes.js";
import router from "./routes/roleRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import residentRoutes from "./routes/society/residentRoutes.js";
import bills from "./routes/society/billRoutes.js";
import paymentRoutes from "./routes/society/paymentRoutes.js";
import residentBillRoutes from "./routes/resident/billRoutes.js";
import residentGateRoutes from "./routes/resident/gateRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js"
import adminComplaintRoutes from "./routes/adminComplaintRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";  
import noticeRoutes from "./routes/noticeRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import StaffRoutes from './routes/staffRoutes.js';
import uploadRoutes from "./routes/upload.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import whatsappService from "./utils/whatsappService.js";
import cron from "node-cron";
import { generateMonthlySalaries } from "./controllers/salaryController.js";
import { autoMarkAbsent } from "./controllers/attendanceController.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import maintenanceRoutes from "./routes/society/maintenanceRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import wingRoutes from "./routes/wingRoutes.js";
import wingAdminRoutes from "./routes/wingAdminRoutes.js"
import wingdeshboard from "./routes/wingAdmin/wingdeshboard.js"
import resiRoutes from "./routes/wingAdmin/resiRoutes.js";
import profileRoutes from "./routes/wingAdmin/profileRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";
import demoUserRoutes from "./routes/demoUserRoutes.js";
import demoVisitorRoutes from "./routes/demoVisitorRoutes.js";
import path from "path";
import http from "http";
import { Server } from "socket.io";

connectDB();

const app = express();

const server = http.createServer(app);
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin = "") =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOriginCheck = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
    return callback(null, true);
  }
  return callback(null, false);
};

console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET);
cron.schedule("0 0 1 * *", async () => {
  console.log("Generating monthly salaries...");
  await generateMonthlySalaries();
});
  
cron.schedule("0 10 * * *", async () => {
  console.log("Running auto-mark absent task...");
  await autoMarkAbsent(io); // emit updates to Socket.IO
});


const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});


io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("joinSociety", (societyId) => {
    socket.join(societyId);
    console.log(`Socket ${socket.id} joined room ${societyId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: corsOriginCheck,
    credentials: true,
  })
);
app.use(express.json());
// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);

  res.status(500).json({
    message: err.message || "Server Error"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admins", routes);
app.use("/api/roles", router);
app.use("/api/activities", activityRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/society/bills", bills);
app.use("/api/resident/bills", residentBillRoutes);
app.use("/api/resident/gate", residentGateRoutes);
app.use("/api/society/payments", paymentRoutes);
app.use("/api/society/residents", residentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
// app.use("/api/society/complaints", complaintRoutes);
app.use("/api/residents/complaints", complaintRoutes);
app.use("/api/admin/complaints", adminComplaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/staff', StaffRoutes);
app.use('/api/salary', salaryRoutes);
app.use("/api/whatsapp", whatsappService);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/performance",performanceRoutes)
app.use("/api/shifts",shiftRoutes)
app.use("/api/wings", wingRoutes);
app.use("/api/wings/admins", wingAdminRoutes);
app.use("/api/wing" , wingdeshboard);
app.use("/api/wing/residents", resiRoutes);
app.use("/api/wing/profile", profileRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/guard", guardRoutes);
app.use("/api/users", demoUserRoutes);
app.use("/api/v-visitors", demoVisitorRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
