import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  Typography,
  Tag,
} from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  AlertOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import api from "@/api/api";
import ResidentDashboard from "../User/ResidentDashboard";
import WingLayout from "@/components/Layout/WingLayout";
import SocietyLoader from "@/components/ui/SocietyLoader";
const { Title } = Typography;

export default function WingDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentResidents, setRecentResidents] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/wing/dashboard");
      setStats(res.data.stats);
      setRecentComplaints(res.data.recentComplaints);
      setRecentResidents(res.data.recentResidents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SocietyLoader fullScreen />;

  const complaintColumns = [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Resident",
      dataIndex: "ownerName",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "Pending"
            ? "orange"
            : status === "In Progress"
            ? "blue"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const residentColumns = [
    {
      title: "Name",
      dataIndex: "ownerName",
    },
    {
      title: "Flat No",
      dataIndex: "flatNo",
    },
  ];

  return (
    <WingLayout>
    <div>
      <Title level={3}>Wing Dashboard</Title>

      {/* --------- Stats Cards --------- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Residents"
              value={stats.totalResidents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Flats"
              value={stats.totalFlats}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Complaints"
              value={stats.totalComplaints}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Complaints"
              value={stats.pendingComplaints}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* --------- Complaint Progress --------- */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <Card title="Complaint Status Overview">
            <p>Resolved</p>
            <Progress percent={stats.resolvedPercentage} status="success" />

            <p style={{ marginTop: 15 }}>In Progress</p>
            <Progress percent={stats.inProgressPercentage} />

            <p style={{ marginTop: 15 }}>Pending</p>
            <Progress percent={stats.pendingPercentage} status="exception" />
          </Card>
        </Col>

        {/* --------- Recent Complaints --------- */}
        <Col xs={24} md={12}>
          <Card title="Recent Complaints">
            <Table
              columns={complaintColumns}
              dataSource={recentComplaints}
              pagination={false}
              rowKey="_id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* --------- Recent Residents --------- */}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Recent Residents">
            <Table
              columns={residentColumns}
              dataSource={recentResidents}
              pagination={false}
              rowKey="_id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
    </WingLayout>
  );
}
