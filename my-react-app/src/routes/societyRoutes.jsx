import {
  DashboardOutlined,
  TeamOutlined,
  AlertOutlined,
  UserOutlined,
  DollarOutlined,
  BellOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  CreditCardOutlined,
  MessageOutlined,
  FormOutlined,
  NotificationOutlined,
  IdcardOutlined,
  ClusterOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import SocietyAdminDashboard from "@/pages/SocietyAdmin/SocietyAdminDashboard";
import Residents from "@/pages/SocietyAdmin/residents/Residents";
import BillsAndMaintenance from "@/pages/SocietyAdmin/Bills/Bills&Maintenance";
import Payments from "@/pages/SocietyAdmin/Payments/Payments";
import SocietyComplaints from "@/pages/SocietyAdmin/Complaints/Complaints";
import CreateComplaint from "@/pages/SocietyAdmin/Complaints/CreateComplaint";
import Notifications from "@/components/Notifications.jsx";
import Notices from "@/pages/SocietyAdmin/Notice/Notices";
import Events from "@/pages/SocietyAdmin/Events/Events";
import Attendance from "@/pages/SocietyAdmin/StaffManagement/Attendance.jsx";
import StaffManagement from "@/pages/SocietyAdmin/StaffManagement/StaffManagement";
import WingManagement from "@/pages/SocietyAdmin/WingManagement/WingManagement";
import EmergencyNotificationLog from "@/pages/SocietyAdmin/Security/EmergencyNotificationLog";
import SocietyProfile from "@/pages/SocietyAdmin/Profile/Profile";
import VisitorReport from "@/pages/SocietyAdmin/Visitors/VisitorReport";
export const societyRoutes = [
  {
    path: "/society/dashboard",
    name: "Dashboard",
    icon: <DashboardOutlined />,
    component: SocietyAdminDashboard,
    protected: true,
    allowedRoles: ["society", "society admin"],
  },
  {
    path: "/society/profile",
    name: "Profile",
    icon: <UserOutlined />,
    component: SocietyProfile,
    protected: true,
    allowedRoles: ["society", "society admin"],
  },
  {
    path: "/society/residents",
    name: "Residents",
    icon: <TeamOutlined />,
    component: Residents,
    protected: true,
    allowedRoles: ["society", "society admin"],
  },

  {
    path: "/society/bills",
    name: "Bills",
    component: BillsAndMaintenance,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <DollarOutlined />,
  },
  {
    path: "/society/payments",
    name: "Payments",
    component: Payments,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <CreditCardOutlined />,
  },
  {
    path: "/society/complaints",
    name: "complaints",
    component: SocietyComplaints,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <MessageOutlined />,
  },
  {
    path: "/society/complaints/create",
    name: "Create Complaint",
    component: CreateComplaint,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <FormOutlined />,
  },
  {
    path: "/society/notifications",
    name: "Notifications",
    component: Notifications,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <BellOutlined />,
  },
  {
    path: "/society/notices",
    name: "Notices",
    component: Notices,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <NotificationOutlined />,
  },
  {
    path: "/society/events",
    name: "Events",
    component: Events,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <CalendarOutlined />,
  },
  {
    path: "/society/visitor-report",
    name: "Visitor Report",
    component: VisitorReport,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <FileTextOutlined />,
  },
  {
    path: "/society/staff",
    name: "Staff Management",
    component: StaffManagement,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <IdcardOutlined />,
  },
  {
    path: "/society/wings",
    name: "Wing Management",
    component: WingManagement,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <ClusterOutlined />,
  },
  {
    path: "/society/emergency-logs",
    name: "Emergency Logs",
    component: EmergencyNotificationLog,
    protected: true,
    allowedRoles: ["society", "society admin"],
    icon: <AlertOutlined />,
  },
  // {
  //   path: "/society/payments",
  //   name: "Payments",
  //   icon: <DollarOutlined />,
  // },
  // {
  //   path: "/society/staff",
  //   name: "Staff Management",
  //   icon: <TeamOutlined />,
  //   protected: true,
  //   allowedRoles: ["society", "society admin"],
  //   children: [
  //     {
  //       path: "/society/staff/dashboard",
  //       name: "Dashboard",
  //       component: StaffDashboard,
  //       icon: <DashboardOutlined />,
  //     },
  //     {
  //       path: "/society/staff/attendance",
  //       name: "Attendance",
  //       component: Attendance,
  //       icon: <CalendarOutlined />,
  //     },
  //     {
  //       path: "/society/staff/feedback",
  //       name: "Feedback",
  //       component: Feedback,
  //       icon: <AlertOutlined />,
  //     },
  //     {
  //       path: "/society/staff/performance",
  //       name: "Performance",
  //       component: Performance,
  //       icon: <TeamOutlined />,
  //     },
  //     {
  //       path: "/society/staff/idcard",
  //       name: "ID Card",
  //       component: StaffIDCard,
  //       icon: <TeamOutlined />,
  //     },
  //   ],
  // },
];
