// src/routes/adminRoutes.js
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  SettingOutlined,
  AlertOutlined,
  ApartmentOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  FileSearchOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import Profile from "../pages/Admin/Profile";
import SocietyConfig from "../pages/Admin/SocietyConfig/SocietyConfig";
import AdminAccounts from "../pages/Admin/AdminAccounts/AdminAccounts";
import OverallReports from "@/pages/Admin/Reports/OverallReports";
import SystemActivities from "@/pages/Admin/SystemActivities/SystemActivities";
import RoleManagement from "@/pages/Admin/Roles/RoleManagement";
import AdminAuditLogs from "@/pages/Admin/AdminAuditLogs/AdminAuditLogs";
import AdminComplaints from "@/pages/Admin/Complaints/Complaints";
import SocietyAdminManagement from "@/pages/Admin/SocietyAdminManagement/SocietyAdminManagement";
import DemoVisitors from "@/pages/Admin/DemoVisitors/DemoVisitors";
// Route configuration
export const adminRoutes = [
  {
    path: "/admin/dashboard",
    name: "Dashboard",
    icon: <DashboardOutlined />,
    component: AdminDashboard,
    protected: true,
  },
 
  {
    path: "/admin/profile",
    name: "Profile",
    icon: <UserOutlined />,
    component: Profile,
    protected: true,
  },
  {
    path: "/admin/society-config",
    name: "Society Config",
    icon: <SettingOutlined />,
    component: SocietyConfig,
    protected: true,
  },
  {
    path: "/admin/admin-accounts",
    name: "Admin Accounts",
    icon: <TeamOutlined />,
    component: AdminAccounts, 
    protected: true,
  },
  {
    path: "/admin/society-admins",
    name: "Society Admins",
    icon: <ApartmentOutlined />,
    component: SocietyAdminManagement,
    protected: true,
  },
  {
    path: "/admin/overall-reports",
    name: "Overall Reports",
    icon: <BarChartOutlined />,
    component: OverallReports,
    protected: true,
  },
  {
    path: "/admin/system-activities",
    name: "System Activities",
    icon: <BellOutlined />,
    component: SystemActivities,
    protected: true,
  },
  {
    path: "/admin/role-management",
    name: "Role Management",
    icon: <SafetyCertificateOutlined />,
    component: RoleManagement,
    protected: true,
  },
   {
    path: "/admin/audit-logs",
    name: "Audit Logs",
    icon: <FileSearchOutlined />,
    component: AdminAuditLogs,
    protected: true,
  },
  {
    path: "/admin/complaints",
    name: "complaints",
    component: AdminComplaints,
    protected: true,
    icon: <AlertOutlined />,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/demo-visitors",
    name: "Demo Visitors",
    component: DemoVisitors,
    protected: true,
    icon: <ContactsOutlined />,
    allowedRoles: ["admin"],
  },

];
