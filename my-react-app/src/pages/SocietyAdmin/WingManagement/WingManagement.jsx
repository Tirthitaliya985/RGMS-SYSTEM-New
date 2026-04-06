import { Tabs } from "antd";
import WingAdmins from "./WingAdmins";
import WingsDashboard from "./WingsDashboard";
// import Flats from "./Flats"; // Optional
import WingReports from "./WingReports"; // Optional
import SocietyLayout from "../../../components/Layout/SocietyLayout";

export default function WingManagement() {
  return (
    <SocietyLayout>
      <div style={{ padding: 20 }}>
        <Tabs defaultActiveKey="wings">

          <Tabs.TabPane tab="Wings Dashboard" key="wingsDashboard">
            <WingsDashboard />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Wing Admins" key="wingAdmins">
            <WingAdmins />
          </Tabs.TabPane>
          
          {/* <Tabs.TabPane tab="Flats" key="flats">
            <Flats />
          </Tabs.TabPane>*/}

          <Tabs.TabPane tab="Reports" key="reports">
            <WingReports />
          </Tabs.TabPane> 
        </Tabs>
      </div>
    </SocietyLayout>
  );
}
