import { Tabs } from "antd";
import StaffDashboard from "./StaffDashboard";
import Attendance from "./Attendance";
import Salary from "./Salary";
import ShiftCalendar from "./ShiftCalendar";
import Performance from "./Performance";
import Feedback from "./Feedback";
import StaffIDCard from "./StaffIDCard";
import WhatsAppPanel from "./WhatsAppPanel";
import Staff from "./Staff";
import SocietyLayout from "../../../components/Layout/SocietyLayout";

export default function StaffManagement() {
  return (
    <SocietyLayout>
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="staff">
        <Tabs.TabPane tab="Staff" key="staff">
          <Staff />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Dashboard" key="dashboard">
          <StaffDashboard />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Attendance" key="attendance">
          <Attendance />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Salary" key="salary">
          <Salary />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Shifts" key="shifts">
          <ShiftCalendar />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Performance" key="performance">
          <Performance />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Feedback" key="feedback">
          <Feedback />
        </Tabs.TabPane>
        <Tabs.TabPane tab="ID Card" key="idcard">
          <StaffIDCard />
        </Tabs.TabPane>
        <Tabs.TabPane tab="WhatsApp" key="whatsapp">
          <WhatsAppPanel />
        </Tabs.TabPane>
      </Tabs>
    </div>
    </SocietyLayout>
  );
}
