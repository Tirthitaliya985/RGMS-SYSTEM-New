import { useCallback, useEffect, useMemo, useState } from "react";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import {
  Card,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  Button,
  Space,
  Tag,
  List,
  Empty,
  Spin,
  Progress,
  Divider,
} from "antd";
import {
  TeamOutlined,
  AlertOutlined,
  DollarOutlined,
  UserOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/api";

const normalizeList = (payload) =>
  Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function SocietyAdminDashboard() {
  const { Title, Text } = Typography;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [residents, setResidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        residentsRes,
        paymentsRes,
        complaintsRes,
        staffRes,
        maintenanceRes,
        eventsRes,
      ] = await Promise.allSettled([
        api.get("/society/residents"),
        api.get("/society/payments"),
        api.get("/residents/complaints"),
        api.get("/staff"),
        api.get("/maintenance/society"),
        api.get("/events"),
      ]);

      const getPayload = (res) =>
        res?.status === "fulfilled" ? res.value?.data : null;

      setResidents(normalizeList(getPayload(residentsRes)));
      setPayments(normalizeList(getPayload(paymentsRes)));
      setComplaints(normalizeList(getPayload(complaintsRes)));
      setStaff(normalizeList(getPayload(staffRes)));
      setMaintenance(normalizeList(getPayload(maintenanceRes)));
      setEvents(normalizeList(getPayload(eventsRes)));

      const failedCalls = [
        residentsRes,
        paymentsRes,
        complaintsRes,
        staffRes,
        maintenanceRes,
        eventsRes,
      ].filter((res) => res.status === "rejected").length;

      if (failedCalls > 0) {
        message.warning(
          `Loaded dashboard with ${failedCalls} partial failure${failedCalls > 1 ? "s" : ""}.`,
        );
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const pendingComplaints = useMemo(
    () => complaints.filter((c) => c.status !== "Resolved"),
    [complaints],
  );

  const activeStaff = useMemo(
    () =>
      staff.filter((s) => String(s.status || "").toLowerCase() === "active"),
    [staff],
  );

  const monthlyCollection = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments],
  );

  const resolvedComplaintsCount = useMemo(
    () => complaints.filter((c) => c.status === "Resolved").length,
    [complaints],
  );

  const complaintResolutionRate = useMemo(() => {
    if (!complaints.length) return 0;
    return Math.round((resolvedComplaintsCount / complaints.length) * 100);
  }, [complaints, resolvedComplaintsCount]);

  const maintenanceDemand = useMemo(
    () =>
      maintenance.reduce(
        (sum, bill) => sum + Number(bill.totalAmount || bill.amount || 0),
        0,
      ),
    [maintenance],
  );

  const collectionEfficiency = useMemo(() => {
    if (!maintenanceDemand) return 0;
    return Math.min(100, Math.round((monthlyCollection / maintenanceDemand) * 100));
  }, [monthlyCollection, maintenanceDemand]);

  const avgEventParticipants = useMemo(() => {
    if (!events.length) return 0;
    const total = events.reduce(
      (sum, event) => sum + Number(event.participants || event.attendees?.length || 0),
      0,
    );
    return Math.round(total / events.length);
  }, [events]);

  const complaintChart = useMemo(
    () => [
      {
        name: "Pending",
        value: complaints.filter((c) => c.status === "Pending").length,
      },
      {
        name: "In Progress",
        value: complaints.filter((c) => c.status === "In Progress").length,
      },
      {
        name: "Resolved",
        value: complaints.filter((c) => c.status === "Resolved").length,
      },
    ],
    [complaints],
  );

  const maintenanceChart = useMemo(
    () =>
      maintenance.map((bill) => ({
        month: bill.month,
        amount: Number(bill.totalAmount || bill.amount || 0),
      })),
    [maintenance],
  );

  const eventChart = useMemo(
    () =>
      events.map((e) => ({
        name: e.title,
        participants: e.participants || e.attendees?.length || 0,
      })),
    [events],
  );

  const recentComplaints = useMemo(() => complaints.slice(0, 5), [complaints]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => event.eventDate && new Date(event.eventDate) >= now)
      .slice(0, 5);
  }, [events]);

  const cardStyle = {
    backgroundColor: isDark ? "#1f2940" : "#ffffff",
    color: isDark ? "#fff" : "#000",
    border: `1px solid ${isDark ? "#2f436d" : "#edf2f7"}`,
    borderRadius: 14,
  };

  const statCardStyle = {
    ...cardStyle,
    boxShadow: isDark
      ? "0 10px 22px rgba(0, 0, 0, 0.35)"
      : "0 10px 22px rgba(15, 23, 42, 0.08)",
  };

  const headerCardStyle = {
    ...cardStyle,
    backgroundColor: "transparent",
    "--ui-card-grad-light": "linear-gradient(120deg, #ffffff 0%, #eef6ff 100%)",
    "--ui-card-grad-dark": "linear-gradient(120deg, #1f2940 0%, #22375c 100%)",
  };

  const insightCardStyle = {
    ...cardStyle,
    backgroundColor: "transparent",
    "--ui-card-grad-light": "linear-gradient(140deg, #f8fbff 0%, #eef5ff 100%)",
    "--ui-card-grad-dark": "linear-gradient(140deg, #1a2844 0%, #1f395d 100%)",
  };

  const getComplaintTagColor = (status) => {
    if (status === "Resolved") return "success";
    if (status === "In Progress") return "processing";
    return "warning";
  };

  const sectionGutter = [20, 20];
  const cardBodyStyle = { padding: "20px" };
  const colStyle = { minWidth: 0 };
  const textClampStyle = {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
  const longTextStyle = { wordBreak: "break-word", whiteSpace: "normal" };

  return (
    <SocietyLayout>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Card className="ui-gradient-card" style={headerCardStyle} styles={{ body: { padding: "22px 24px" } }}>
          <Row justify="space-between" align="middle" gutter={[12, 12]}>
            <Col>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: isDark ? "#fff" : "#13233e",
                }}
              >
                Society Dashboard
              </Title>
              <Text style={{ color: isDark ? "#c3d4f3" : "#334155" }}>
                Real-time snapshot of residents, collections, complaints, and events.
              </Text>
            </Col>
            <Col style={colStyle}>
              <Space wrap>
                <Tag color={isDark ? "blue" : "geekblue"}>
                  Records: {residents.length + complaints.length + payments.length + events.length}
                </Tag>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchDashboardData}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading}>
          <div style={{  width: "100%", overflowX: "hidden" }}>
          <Row gutter={sectionGutter}>
            <Col xs={24} sm={12} lg={6} style={colStyle}>
              <Card style={statCardStyle} styles={{ body: cardBodyStyle }}>
                <Statistic
                  title="Total Residents"
                  value={residents.length}
                  prefix={<TeamOutlined />}
                />
                <Text type="secondary">
                  Registered units currently active in society
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6} style={colStyle}>
              <Card style={statCardStyle} styles={{ body: cardBodyStyle }}>
                <Statistic
                  title="Pending Complaints"
                  value={pendingComplaints.length}
                  prefix={<AlertOutlined />}
                />
                <Text type="secondary">
                  Open service requests awaiting completion
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6} style={colStyle}>
              <Card style={statCardStyle} styles={{ body: cardBodyStyle }}>
                <Statistic
                  title="Monthly Collection (INR)"
                  value={monthlyCollection}
                  precision={0}
                  prefix={<DollarOutlined />}
                />
                <Text type="secondary">{formatCurrency(monthlyCollection)} received</Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6} style={colStyle}>
              <Card style={statCardStyle} styles={{ body: cardBodyStyle }}>
                <Statistic
                  title="Active Staff"
                  value={activeStaff.length}
                  prefix={<UserOutlined />}
                />
                <Text type="secondary">
                  Team members available for operations
                </Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={sectionGutter} style={{ marginTop: 8 }}>
            <Col xs={24} lg={8} style={colStyle}>
              <Card className="ui-gradient-card" style={insightCardStyle} styles={{ body: cardBodyStyle }}>
                <Text strong style={{ color: isDark ? "#dbeafe" : "#1e3a8a" }}>
                  Collection Efficiency
                </Text>
                <Divider style={{ margin: "10px 0" }} />
                <Title level={4} style={{ margin: 0, color: isDark ? "#fff" : "#0f172a" }}>
                  {collectionEfficiency}%
                </Title>
                <Progress
                  percent={collectionEfficiency}
                  showInfo={false}
                  strokeColor="#22c55e"
                  trailColor={isDark ? "#304b76" : "#dbeafe"}
                  style={{ marginTop: 10 }}
                />
                <Text type="secondary">
                  {formatCurrency(monthlyCollection)} of {formatCurrency(maintenanceDemand)}
                </Text>
              </Card>
            </Col>

            <Col xs={24} lg={8} style={colStyle}>
              <Card className="ui-gradient-card" style={insightCardStyle} styles={{ body: cardBodyStyle }}>
                <Text strong style={{ color: isDark ? "#dbeafe" : "#1e3a8a" }}>
                  Complaint Resolution
                </Text>
                <Divider style={{ margin: "10px 0" }} />
                <Title level={4} style={{ margin: 0, color: isDark ? "#fff" : "#0f172a" }}>
                  {complaintResolutionRate}%
                </Title>
                <Progress
                  percent={complaintResolutionRate}
                  showInfo={false}
                  strokeColor="#3b82f6"
                  trailColor={isDark ? "#304b76" : "#dbeafe"}
                  style={{ marginTop: 10 }}
                />
                <Text type="secondary">
                  {resolvedComplaintsCount} resolved of {complaints.length} total
                </Text>
              </Card>
            </Col>

            <Col xs={24} lg={8} style={colStyle}>
              <Card className="ui-gradient-card" style={insightCardStyle} styles={{ body: cardBodyStyle }}>
                <Text strong style={{ color: isDark ? "#dbeafe" : "#1e3a8a" }}>
                  Event Engagement
                </Text>
                <Divider style={{ margin: "10px 0" }} />
                <Title level={4} style={{ margin: 0, color: isDark ? "#fff" : "#0f172a" }}>
                  {avgEventParticipants}
                </Title>
                <Progress
                  percent={Math.min(100, avgEventParticipants * 5)}
                  showInfo={false}
                  strokeColor="#ec4899"
                  trailColor={isDark ? "#304b76" : "#dbeafe"}
                  style={{ marginTop: 10 }}
                />
                <Text type="secondary">
                  Average attendees per event
                </Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={sectionGutter} style={{ marginTop: 8 }}>
            <Col xs={24} lg={8} style={colStyle}>
              <Card title="Complaint Status" style={cardStyle} styles={{ body: cardBodyStyle }}>
                {complaintChart.every((item) => item.value === 0) ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No complaints yet"
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={complaintChart}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label
                      >
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                      </Pie>
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#13233e" : "#ffffff",
                          border: `1px solid ${isDark ? "#2f436d" : "#e2e8f0"}`,
                          borderRadius: 10,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8} style={colStyle}>
              <Card title="Maintenance Collection" style={cardStyle} styles={{ body: cardBodyStyle }}>
                {!maintenanceChart.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No maintenance generated"
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={maintenanceChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fill: isDark ? "#cbd5e1" : "#334155" }} />
                      <YAxis tick={{ fill: isDark ? "#cbd5e1" : "#334155" }} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: isDark ? "#13233e" : "#ffffff",
                          border: `1px solid ${isDark ? "#2f436d" : "#e2e8f0"}`,
                          borderRadius: 10,
                        }}
                      />
                      <Bar dataKey="amount" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8} style={colStyle}>
              <Card title="Event Participation" style={cardStyle} styles={{ body: cardBodyStyle }}>
                {!eventChart.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No events available"
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: isDark ? "#cbd5e1" : "#334155" }}
                        tickFormatter={(value) =>
                          String(value || "").length > 10
                            ? `${String(value).slice(0, 10)}...`
                            : value
                        }
                        interval="preserveStartEnd"
                        minTickGap={20}
                        angle={-12}
                        textAnchor="end"
                        height={56}
                      />
                      <YAxis tick={{ fill: isDark ? "#cbd5e1" : "#334155" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#13233e" : "#ffffff",
                          border: `1px solid ${isDark ? "#2f436d" : "#e2e8f0"}`,
                          borderRadius: 10,
                        }}
                      />
                      <Bar dataKey="participants" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={sectionGutter} style={{ marginTop: 8 }}>
            <Col xs={24} lg={12} style={colStyle}>
              <Card title="Recent Complaints" style={cardStyle} styles={{ body: cardBodyStyle }}>
                {!recentComplaints.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No complaints found"
                  />
                ) : (
                  <List
                    dataSource={recentComplaints}
                    renderItem={(item) => (
                      <List.Item style={{ alignItems: "flex-start", gap: 10 }}>
                        <List.Item.Meta
                          title={
                            <Text strong style={textClampStyle}>
                              {item.subject || "Complaint"}
                            </Text>
                          }
                          description={
                            <Text type="secondary" style={longTextStyle}>
                              {item.description || "No description"}
                            </Text>
                          }
                        />
                        <Tag color={getComplaintTagColor(item.status)}>
                          {item.status || "Pending"}
                        </Tag>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12} style={colStyle}>
              <Card title="Upcoming Events" style={cardStyle} styles={{ body: cardBodyStyle }}>
                {!upcomingEvents.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No upcoming events"
                  />
                ) : (
                  <List
                    dataSource={upcomingEvents}
                    renderItem={(item) => (
                      <List.Item style={{ alignItems: "flex-start", gap: 10 }}>
                        <List.Item.Meta
                          avatar={<CalendarOutlined style={{ fontSize: 18 }} />}
                          title={
                            <Text strong style={textClampStyle}>
                              {item.title || "Event"}
                            </Text>
                          }
                          description={
                            <Text type="secondary" style={longTextStyle}>
                              {item.eventDate
                                ? new Date(item.eventDate).toLocaleDateString()
                                : "Date not set"}
                            </Text>
                          }
                        />
                        <Tag color="blue">
                          {(item.attendees || []).length} Attendees
                        </Tag>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
          </div>
        </Spin>
      </Space>
    </SocietyLayout>
  );
}
