# Luxury Residential Society Management System (RGMS)
**Project Documentation Report**

**Document Control**
- Project Title: Luxury Residential Society Management System (RGMS)
- Document Version: 1.0
- Prepared By: [Your Name]
- Institution: [College/University Name]
- Department: [Department Name]
- Academic Year: 2025–2026
- Date: 12 March 2026

**Abstract**
The Luxury Residential Society Management System (RGMS) is a full‑stack web application designed to digitize core operations of a residential society. It centralizes resident management, billing, payments, complaints, staff management, security, and communication. The system supports multiple roles (admin, society admin, wing admin, guard, resident) with role‑based access and real‑time updates. This report documents the architecture, modules, technology stack, and deployment model of the project.

**Problem Statement**
Residential societies often manage operations using fragmented processes such as paper registers, spreadsheets, and ad‑hoc messaging. This leads to data inconsistency, slow response to complaints, weak audit trails, and inefficient staff management. RGMS aims to provide a unified system to streamline governance, improve transparency, and enable faster communication.

**Objectives**
- Provide a centralized digital platform for society operations.
- Enable role‑based access for different stakeholders.
- Automate billing, payments, and salary workflows.
- Improve complaint tracking and resolution visibility.
- Provide real‑time notifications for events, emergencies, and updates.
- Maintain auditable records of key administrative actions.

**Scope**
- Residential society operations for admin, society admin, wing admin, guard, and resident roles.
- Modules: resident management, billing, payments, complaints, maintenance, staff, attendance, notifications, and visitor management.
- Web‑based interfaces for administrators and residents.

**System Overview**
RGMS is organized as a multi‑package repository:
- `server`: Main backend API (Node.js + Express + MongoDB).
- `my-react-app`: Main web frontend (React + Vite).
- `luxury-residential-system-visitor`: Visitor‑focused marketing/demo site with its own frontend and backend.
- `docs`: Demo guides and project documentation.

**Technology Stack**
- Frontend: React 19, Vite 7, Ant Design, Tailwind CSS, Redux Toolkit, Zustand, Socket.IO client.
- Backend: Node.js, Express 5, MongoDB (Mongoose), Socket.IO, Node‑Cron, Multer.
- Communication: Nodemailer (email), Twilio (SMS), WhatsApp Web API.
- Payments: Razorpay.
- Deployment: Render (backend), Vercel (frontend), per config files.

**Architecture**
```
Browser (React UI)
  |
  | REST API + Socket.IO
  v
Express Server (server/)
  |
  | Mongoose
  v
MongoDB Database
```

**User Roles**
- Admin: System‑level administration and configuration.
- Society Admin: Manages society operations, staff, billing, and notices.
- Wing Admin: Manages wing‑level residents, complaints, and profile data.
- Guard: Handles gate operations, visitor/vehicle/parcel logs, emergency alerts.
- Resident: Accesses bills, complaints, notices, and gate updates.

**Core Modules**
- Authentication and Authorization
- Dashboard and Activity Tracking
- Society and Wing Management
- Resident Management
- Billing and Maintenance
- Payments (Razorpay integration)
- Complaints and Admin Complaints
- Notices and Events
- Staff Management, Attendance, Salary, Shifts, Performance
- Visitor and Gate Management
- Notifications and Alerts (Email/SMS/WhatsApp)
- File Uploads (documents and images)

**Backend API Structure**
Main API entry: `server/server.js`
- `/api/auth`: Authentication and JWT handling
- `/api/dashboard`: Dashboard data
- `/api/admins`: Admin management
- `/api/roles`: Role management
- `/api/activities`: Activity logs
- `/api/societies`: Society management
- `/api/society/bills`: Society billing
- `/api/society/payments`: Payments
- `/api/society/residents`: Society resident management
- `/api/maintenance`: Maintenance workflows
- `/api/residents/complaints`: Resident complaints
- `/api/admin/complaints`: Admin complaints
- `/api/notifications`: Notifications
- `/api/notices`: Notices
- `/api/events`: Events
- `/api/staff`: Staff management
- `/api/salary`: Salary management
- `/api/attendance`: Attendance records
- `/api/performance`: Performance tracking
- `/api/shifts`: Shift scheduling
- `/api/wings`: Wing management
- `/api/wings/admins`: Wing admin management
- `/api/wing`: Wing dashboard
- `/api/wing/residents`: Wing residents
- `/api/wing/profile`: Wing admin profile
- `/api/visitors`: Visitor logs
- `/api/guard`: Guard tools
- `/api/users`: Demo users
- `/api/v-visitors`: Demo visitors
- `/api/whatsapp`: WhatsApp integration
- `/api/upload`: File upload

**Database Design (MongoDB Models)**
Key collections in `server/models`:
- Activity, AdminComplaint, Attendance, Audit, Bill, Complaint
- DemoUser, DemoVisitor, EmergencyAlert, Event, Maintenance
- Notice, Notification, Parcel, Payment, Performance
- Resident, Role, Salary, Shift, Society
- Staff, StaffFeedback, User, Visitor
- wingModel, wingAdminModel

**Real‑Time Features**
- Socket.IO is used for real‑time updates (e.g., attendance and notifications).
- Each society can be joined as a room for scoped updates.

**Scheduled Jobs**
- Monthly salary generation on day 1 of each month.
- Daily automatic attendance processing.

**Security**
- JWT‑based authentication and role‑based authorization.
- CORS restrictions configured through `CORS_ORIGINS`.
- Sensitive values stored via environment variables.

**Environment Configuration**
Backend (`.env` based on `.env.example` in repo root):
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `MONGO_URI`
- `JWT_SECRET`
- Email settings for OTP (SMTP details)

Frontend (`my-react-app/.env.production.example`):
- `VITE_API_URL` for backend base URL
- `CORS_ORIGINS` for allowed origins
- `LIVE_DEMO_URL` for deployed demo

**Setup and Run (Local Development)**
Backend:
1. `cd server`
2. Create `.env` based on root `.env.example`
3. `npm install`
4. `npm run dev`

Frontend (Main App):
1. `cd my-react-app`
2. Create `.env` (if needed) with `VITE_API_URL`
3. `npm install`
4. `npm run dev`

Visitor App (Optional):
1. `cd luxury-residential-system-visitor/visitor`
2. `npm install`
3. `npm run dev`

**Deployment**
- Backend is configured for Render via `render.yaml`.
- Frontend has Vercel configuration in `my-react-app/vercel.json`.
- Production environment variables are required for API URLs and integrations.

**Testing**
- No automated tests are configured in the current scripts.
- Manual testing is performed for role‑based flows and integrations.

**Limitations**
- Automated test suite is not yet implemented.
- Payment, WhatsApp, and SMS features require external credentials.
- Some features depend on active cron jobs and Socket.IO server availability.

**Future Enhancements**
- Add automated unit and integration tests.
- Add audit dashboards and report exports.
- Improve analytics for staff and security events.
- Multi‑tenant support for multiple societies with isolated databases.

**Appendix**
- Existing demo documentation: `docs/demo-guide.html` and `docs/Society-Management-Demo-Guide.pdf`
