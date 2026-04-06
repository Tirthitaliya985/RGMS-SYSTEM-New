import { Card, Row, Col, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/context/AuthContext";
// user.societyId will be used to fetch the society name

const { Title } = Typography;

export default function WingReports() {
  const [wings, setWings] = useState([]);
  const { user } = useAuth(); 

  const [loading, setLoading] = useState(false);
  const [societyName, setSocietyName] = useState("");

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch wings
      const wingsRes = await api.get("/wings");
      setWings(wingsRes.data.data || []);

      // Fetch society info using societyId from user
      if (user?.societyId) {
        const societyRes = await api.get(`/societies/${user.societyId}`);
        setSocietyName(societyRes.data.data.name || "My Society");
      } else {
        setSocietyName("My Society");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  fetchData();
}, [user?.societyId]);


  const totalUnits = wings.reduce((sum, w) => sum + w.totalFloors * w.totalFlats, 0);
  const totalAdmins = wings.filter(w => w.admin).length;

  const columns = [
    { title: "Wing", dataIndex: "wing" },
    { title: "Code", dataIndex: "code" },
    { title: "Floors", dataIndex: "totalFloors" },
    { title: "Flats per Floor", dataIndex: "totalFlats" },
    { title: "Total Units", render: (_, w) => w.totalFloors * w.totalFlats },
    { title: "Admin", render: (_, w) => w.admin?.name || "N/A" },
  ];

  // Prepare data for chart: Units per Wing
  const chartData = wings.map(w => ({
    wing: w.wing,
    units: w.totalFloors * w.totalFlats,
  }));

  return (
    <div style={{ padding: 20 }}>
      {/* Society Name */}
      <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
        {societyName} - Wing Reports
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
        <Col xs={24} sm={8}>
          <Card title="Total Wings" bordered={false} style={{ textAlign: "center", background: "#e6f7ff" }}>
            <Title level={3}>{wings.length}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="Total Units" bordered={false} style={{ textAlign: "center", background: "#fff7e6" }}>
            <Title level={3}>{totalUnits}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="Total Admins" bordered={false} style={{ textAlign: "center", background: "#f6ffed" }}>
            <Title level={3}>{totalAdmins}</Title>
          </Card>
        </Col>
      </Row>

      {/* Units per Wing Chart */}
      <Card title="Units per Wing" style={{ marginBottom: 30 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="wing" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="units" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Wings Table */}
      <Card title="Wings Details">
        <Table
          dataSource={wings}
          columns={columns}
          rowKey="_id"
          loading={loading}
          bordered
        />
      </Card>
    </div>
  );
}
