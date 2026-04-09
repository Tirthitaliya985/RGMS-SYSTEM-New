import { Tabs } from "antd";
import Bills from "./Bills";
import Maintenance from "./Maintenance";
import SocietyLayout from "../../../components/Layout/SocietyLayout";

export default function BillsAndMaintenance() {
  return (
    <SocietyLayout>
      <div style={{ padding: 20 }}>
        <Tabs defaultActiveKey="bills">

          <Tabs.TabPane tab="Bills" key="bills">
            <Bills />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Maintenance" key="maintenance">
            <Maintenance />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </SocietyLayout>
  );
}
