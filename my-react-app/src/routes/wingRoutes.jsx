import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  SettingOutlined,
  AlertOutlined,
  CalendarOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import wingDashboard from "@/pages/wingAdmin/wingDashboard";
import Residents from "@/pages/wingAdmin/Residents/Residents";
import WingProfile from "@/pages/wingAdmin/Profile/Profile";
import Maintenance from "@/pages/wingAdmin/Maintenance/Maintenance";
import Events from "@/pages/SocietyAdmin/Events/Events";
import Notices from "@/pages/SocietyAdmin/Notice/Notices";
import WingStaffAttendance from "@/pages/wingAdmin/StaffAttendance";

export const wingRoutes = [
  {
    path: "/wing/dashboard",
    name: "Dashboard",
    icon: <DashboardOutlined />,
    component: wingDashboard,
    protected: true,
    allowedRoles: ["wingadmin", "wing admin"],
  },
  {      
    path: "/wing/profile",
    name: "Profile",
    icon: <UserOutlined />,
    component: WingProfile,
    protected: true,
    allowedRoles: ["wingadmin", "wing admin"],
  },

   {
    path: "/wing/residents",
    name: "Residents",
    icon: <UserOutlined />,
    component: Residents,
    protected: true,
    allowedRoles: ["wingadmin", "wing admin"],
  },
   {      
    path: "/wing/maintenance",
    name: "Maintenance",
    icon: <AlertOutlined />,
    component: Maintenance,
    protected: true,
    allowedRoles: ["wingadmin", "wing admin"],
  },
  {
    path: "/wing/events",
    name: "Events",
    icon: <CalendarOutlined />,
    component: Events,
    protected: true,
    allowedRoles: ["wingadmin", "wing admin"],
  },
  {
    path: "/wing/notices",
    name: "Notices",
    icon: <NotificationOutlined />,
    component: Notices,
    protected: true,
    allowedRoles: ["wingadmin", "wing admin"],
  },
  // {
  //   path: "/wing/staff-attendance",
  //   name: "Staff Attendance",
  //   icon: <CheckCircleOutlined />,
  //   component: WingStaffAttendance,
  //   protected: true,
  //   allowedRoles: ["wingadmin", "wing admin"],
  // },

]

