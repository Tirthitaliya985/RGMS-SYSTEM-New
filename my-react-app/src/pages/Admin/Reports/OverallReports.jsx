import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tag,
  Button,
  Alert,
  Skeleton,
  Table,
} from "antd";
import {
  TeamOutlined,
  AppstoreOutlined,
  AlertOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import AdminLayout from "../../../components/Layout/AdminLayout";
import api from "../../../api/api";
import { useTheme } from "../../../context/ThemeContext";

const { Title, Text } = Typography;

const statusColors = ["#10b981", "#ef4444"];

const safeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function OverallReports() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [societies, setSocieties] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchReportData = async (manualRefresh = false) => {
    if (manualRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const [societiesRes, complaintsRes, eventsRes, activitiesRes] =
        await Promise.all([
          api.get("/societies"),
          api.get("/admin/complaints"),
          api.get("/events"),
          api.get("/activities"),
        ]);

      setSocieties(safeArray(societiesRes.data));
      setComplaints(safeArray(complaintsRes.data));
      setEvents(safeArray(eventsRes.data));
      setActivities(safeArray(activitiesRes.data));
      setUpdatedAt(new Date());
    } catch (err) {
      console.error("Failed to load overall reports:", err);
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const totalUnits = useMemo(
    () =>
      societies.reduce((sum, society) => {
        const units = Number(society?.units || 0);
        return sum + (Number.isFinite(units) ? units : 0);
      }, 0),
    [societies]
  );

  const openComplaints = useMemo(
    () => complaints.filter((item) => item?.status === "Pending").length,
    [complaints]
  );

  const complaintStatusData = useMemo(
    () => [
      {
        name: "Resolved",
        value: complaints.filter((c) => c?.status === "Resolved").length,
      },
      {
        name: "Pending",
        value: complaints.filter((c) => c?.status !== "Resolved").length,
      },
    ],
    [complaints]
  );

  const societyUnitsData = useMemo(
    () =>
      societies.map((society) => ({
        name: society?.name || "N/A",
        units: Number(society?.units || 0),
      })),
    [societies]
  );

  const eventParticipationData = useMemo(
    () =>
      events.map((event) => ({
        name: event?.title || "Untitled",
        participants: Array.isArray(event?.attendees) ? event.attendees.length : 0,
      })),
    [events]
  );

  const activityTrendData = useMemo(() => {
    const byDate = {};
    activities.forEach((activity) => {
      const rawDate = activity?.createdAt || activity?.time;
      if (!rawDate) return;

      const label = new Date(rawDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      byDate[label] = (byDate[label] || 0) + 1;
    });

    return Object.entries(byDate).map(([day, count]) => ({ day, count }));
  }, [activities]);

  const cardStyle = {
    borderRadius: 16,
    background: isDark
      ? "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))"
      : "linear-gradient(145deg, #ffffff, #f0f9ff)",
    border: isDark ? "1px solid rgba(148,163,184,0.22)" : "1px solid #e0f2fe",
    boxShadow: isDark
      ? "0 10px 28px rgba(2, 6, 23, 0.45)"
      : "0 10px 24px rgba(14, 116, 144, 0.08)",
  };

  const axisColor = isDark ? "#cbd5e1" : "#334155";

  const activityColumns = [
    {
      title: "Admin",
      dataIndex: "username",
      key: "username",
      render: (value) => value || "Unknown",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value, row) => {
        const date = value || row?.time;
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
  ];

  return (
    <AdminLayout>
      <Card
        bordered={false}
        style={{
          ...cardStyle,
          marginBottom: 18,
          background: isDark
            ? "linear-gradient(120deg, #0f172a, #134e4a)"
            : "linear-gradient(120deg, #ecfeff, #e0f2fe)",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>
                Overall Reports
              </Title>
              <Space size={10}>
                <Tag color={isDark ? "cyan" : "blue"}>Backend Connected</Tag>
                <Text style={{ color: isDark ? "#94a3b8" : "#334155" }}>
                  {updatedAt ? `Updated: ${updatedAt.toLocaleString()}` : "Waiting for data"}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={refreshing}
              onClick={() => fetchReportData(true)}
            >
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Could not load report data"
          description={error}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Total Societies"
                value={societies.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Total Units"
                value={totalUnits}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Open Complaints"
                value={openComplaints}
                prefix={<AlertOutlined />}
                valueStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Total Events"
                value={events.length}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 6 }}>
        <Col xs={24} xl={12}>
          <Card title="Society Capacity (Units)" style={cardStyle}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={societyUnitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#cbd5e1"} />
                <XAxis dataKey="name" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip />
                <Bar dataKey="units" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="Activities Trend" style={cardStyle}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#cbd5e1"} />
                <XAxis dataKey="day" stroke={axisColor} />
                <YAxis stroke={axisColor} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 6 }}>
        <Col xs={24} xl={12}>
          <Card title="Complaint Resolution" style={cardStyle}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {complaintStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="Event Participation" style={cardStyle}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventParticipationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#cbd5e1"} />
                <XAxis dataKey="name" stroke={axisColor} />
                <YAxis stroke={axisColor} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="participants" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Recent System Activities" style={{ ...cardStyle, marginTop: 16 }}>
        <Table
          dataSource={activities.slice(0, 8)}
          columns={activityColumns}
          loading={loading}
          rowKey={(row) => row._id || `${row.username}-${row.time}`}
          locale={{ emptyText: "No activity records available" }}
          pagination={false}
        />
      </Card>
    </AdminLayout>
  );
}
