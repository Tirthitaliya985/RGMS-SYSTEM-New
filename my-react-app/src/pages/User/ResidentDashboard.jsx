import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  AlertOutlined,
  CreditCardOutlined,
  InboxOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import api from "@/api/api";

const visitorStatusColor = {
  pending: "orange",
  approved: "blue",
  arrived: "green",
  exited: "default",
  rejected: "red",
};

const complaintStatusColor = {
  Pending: "orange",
  "In Progress": "blue",
  Resolved: "green",
};

export default function ResidentDashboard() {
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [bills, setBills] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [visitorsRes, parcelsRes, emergenciesRes, complaintsRes, billsRes] =
        await Promise.all([
          api.get("/resident/gate/visitors", { params: { today: true } }),
          api.get("/resident/gate/parcels", { params: { today: true } }),
          api.get("/resident/gate/emergency-alerts"),
          api.get("/residents/complaints"),
          api.get("/resident/bills"),
        ]);

      setVisitors(visitorsRes.data?.data || []);
      setParcels(parcelsRes.data?.data || []);
      setEmergencies(emergenciesRes.data?.data || []);
      setComplaints(complaintsRes.data?.data || []);
      const billRows = Array.isArray(billsRes.data)
        ? billsRes.data
        : billsRes.data?.data || [];
      setBills(billRows);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load resident dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const pendingBills = bills.filter((b) => String(b.status || "").toLowerCase() !== "paid");
    const totalDue = pendingBills.reduce(
      (sum, b) => sum + Number(b.remainingAmount ?? b.amount ?? 0),
      0
    );

    return {
      totalVisitorsToday: visitors.length,
      insideVisitors: visitors.filter((v) => v.status === "arrived").length,
      pendingParcels: parcels.filter((p) => p.status === "pending").length,
      openEmergencies: emergencies.filter((e) => e.status === "open").length,
      openComplaints: complaints.filter((c) => c.status !== "Resolved").length,
      totalDue,
    };
  }, [bills, complaints, emergencies, parcels, visitors]);

  const visitorColumns = [
    { title: "Visitor", dataIndex: "visitorName", key: "visitorName" },
    { title: "Purpose", dataIndex: "purpose", key: "purpose" },
    {
      title: "Time",
      dataIndex: "scheduledFor",
      key: "scheduledFor",
      render: (v) => (v ? dayjs(v).format("DD MMM, hh:mm A") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={visitorStatusColor[s] || "default"}>{String(s || "").toUpperCase()}</Tag>,
    },
  ];

  const parcelColumns = [
    { title: "Courier", dataIndex: "courier", key: "courier" },
    { title: "Tracking", dataIndex: "trackingId", key: "trackingId", render: (v) => v || "-" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "pending" ? "orange" : "green"}>{String(s || "").toUpperCase()}</Tag>,
    },
    {
      title: "Received At",
      dataIndex: "receivedAt",
      key: "receivedAt",
      render: (v) => (v ? dayjs(v).format("DD MMM, hh:mm A") : "-"),
    },
  ];

  const complaintColumns = [
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={complaintStatusColor[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => dayjs(v).format("DD MMM, hh:mm A"),
    },
  ];

  return (
    <ResidentLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Resident Dashboard
            </Typography.Title>
            <Typography.Text type="secondary">
              Overview of gate activity, dues, parcels, and complaints.
            </Typography.Text>
          </div>
          <Button onClick={loadDashboard}>Refresh</Button>
        </Space>

        {loading ? (
          <Card>
            <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
              <Spin />
            </div>
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8} lg={4}>
                <Card>
                  <Statistic title="Visitors Today" value={stats.totalVisitorsToday} prefix={<TeamOutlined />} />
                </Card>
              </Col>
              <Col xs={24} md={8} lg={4}>
                <Card>
                  <Statistic title="Visitors Inside" value={stats.insideVisitors} prefix={<TeamOutlined />} />
                </Card>
              </Col>
              <Col xs={24} md={8} lg={4}>
                <Card>
                  <Statistic title="Pending Parcels" value={stats.pendingParcels} prefix={<InboxOutlined />} />
                </Card>
              </Col>
              <Col xs={24} md={8} lg={4}>
                <Card>
                  <Statistic title="Open Emergencies" value={stats.openEmergencies} prefix={<WarningOutlined />} />
                </Card>
              </Col>
              <Col xs={24} md={8} lg={4}>
                <Card>
                  <Statistic title="Open Complaints" value={stats.openComplaints} prefix={<AlertOutlined />} />
                </Card>
              </Col>
              <Col xs={24} md={8} lg={4}>
                <Card>
                  <Statistic title="Total Due (Rs)" value={stats.totalDue} precision={2} prefix={<CreditCardOutlined />} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Recent Visitors">
                  <Table
                    rowKey="_id"
                    columns={visitorColumns}
                    dataSource={visitors.slice(0, 5)}
                    pagination={false}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Recent Parcels">
                  <Table
                    rowKey="_id"
                    columns={parcelColumns}
                    dataSource={parcels.slice(0, 5)}
                    pagination={false}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Recent Complaints">
                  <Table
                    rowKey="_id"
                    columns={complaintColumns}
                    dataSource={complaints.slice(0, 5)}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Space>
    </ResidentLayout>
  );
}
