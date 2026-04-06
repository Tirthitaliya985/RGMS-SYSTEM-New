import {
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  ToolOutlined,
  QrcodeOutlined,
  CarOutlined,
  AlertOutlined,
  InboxOutlined,
  CalendarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import GuardPanel from "@/pages/Guard/GuardPanel";
import DeliveryManagement from "@/pages/Guard/DeliveryManagement";
import WorkerEntry from "@/pages/Guard/WorkerEntry";
import GatePassQR from "@/pages/Guard/GatePassQR";
import VehicleTracking from "@/pages/Guard/VehicleTracking";
import EmergencyAlert from "@/pages/Guard/EmergencyAlert";
import ParcelManagement from "@/pages/Guard/ParcelManagement";
import Events from "@/pages/SocietyAdmin/Events/Events";
import Notices from "@/pages/SocietyAdmin/Notice/Notices";

export const guardRoutes = [
  {
    path: "/guard/panel",
    name: "Visitor Entry",
    icon: <SafetyCertificateOutlined />,
    component: GuardPanel,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/delivery",
    name: "Delivery Mgmt",
    icon: <ShoppingOutlined />,
    component: DeliveryManagement,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/workers",
    name: "Worker Entry",
    icon: <ToolOutlined />,
    component: WorkerEntry,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/gate-pass-qr",
    name: "Gate Pass QR",
    icon: <QrcodeOutlined />,
    component: GatePassQR,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/vehicles",
    name: "Vehicle Tracking",
    icon: <CarOutlined />,
    component: VehicleTracking,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/emergency",
    name: "Emergency Alert",
    icon: <AlertOutlined />,
    component: EmergencyAlert,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/parcels",
    name: "Parcel Mgmt",
    icon: <InboxOutlined />,
    component: ParcelManagement,
    protected: true,
    allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  },
  {
    path: "/guard/events",
    name: "Events",
    icon: <CalendarOutlined />,
    component: Events,
    protected: true,
    allowedRoles: ["guard"],
  },
  {
    path: "/guard/notices",
    name: "Notices",
    icon: <NotificationOutlined />,
    component: Notices,
    protected: true,
    allowedRoles: ["guard"],
  },
  // {
  //   path: "/guard/arrivals",
  //   name: "Quick Arrivals",
  //   icon: <CheckCircleOutlined />,
  //   component: GatePassQR,
  //   protected: true,
  //   allowedRoles: ["guard", "wingadmin", "wing admin", "society", "society admin"],
  // },
];
