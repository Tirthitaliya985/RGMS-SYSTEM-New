import {
  DashboardOutlined,
  TeamOutlined,
  AlertOutlined,
  MessageOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import ResidentMaintenance from "@/pages/User/Maintenance/Maintenance";
import ResidentComplaint from "@/pages/User/ResidentComplaint";
import ResidentDashboard from "@/pages/User/ResidentDashboard";
import ResidentBills from "@/pages/User/Bills/Bills";
import VisitorsPage from "@/pages/User/Visitors/Visitors";
import GateUpdates from "@/pages/User/Gate/GateUpdates";
import ResidentParcels from "@/pages/User/Gate/Parcels";
import ResidentEmergency from "@/pages/User/Gate/Emergency";
import Events from "@/pages/SocietyAdmin/Events/Events";
import Notices from "@/pages/SocietyAdmin/Notice/Notices";
export const ResidentRoutes = [
  {
    path: "/resident/dashboard",
    name: "Dashboard",
    icon: <DashboardOutlined />,
    component: ResidentDashboard,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/complaints",
    name: "Complaints",
    icon: <MessageOutlined />,
    component: ResidentComplaint,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/maintenance",
    name: "Maintenance",
    icon: <AlertOutlined />,
    component: ResidentMaintenance,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/bills",
    name: "Bills",
    icon: <CreditCardOutlined />,
    component: ResidentBills,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/visitors",
    name: "Visitor Panel",
    icon: <TeamOutlined />,
    component: VisitorsPage,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/events",
    name: "Events",
    icon: <CalendarOutlined />,
    component: Events,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/notices",
    name: "Notices",
    icon: <NotificationOutlined />,
    component: Notices,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/gate-updates",
    name: "Gate Updates",
    icon: <ClockCircleOutlined />,
    component: GateUpdates,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/parcels",
    name: "My Parcels",
    icon: <InboxOutlined />,
    component: ResidentParcels,
    protected: true,
    allowedRoles: ["resident"],
  },
  {
    path: "/resident/emergency",
    name: "Emergency",
    icon: <SafetyCertificateOutlined />,
    component: ResidentEmergency,
    protected: true,
    allowedRoles: ["resident"],
  },
]

