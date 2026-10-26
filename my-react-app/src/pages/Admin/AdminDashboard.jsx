import { useState, useEffect } from "react";
import AdminLayout from "@/components/Layout/AdminLayout";
import { Card, Row, Col, Statistic, Table, message } from "antd";
import { useTheme } from "@/context/ThemeContext";
import api from "@/api/api";
import { SOCKET_URL } from "@/api/backendConfig";
import { io } from "socket.io-client";
import SocietyLoader from "@/components/ui/SocietyLoader";
// import "./Dashboard.css"; // add animation styles

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState({ societies: 0, residents: 0, user: 0, visitors: 0 });
  const [displayStats, setDisplayStats] = useState({ societies: 0, residents: 0, user: 0, visitors: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [highlightedKey, setHighlightedKey] = useState(null);

  const cardStyle = {
    background: isDark ? "#1f2937" : "#fff",
    color: isDark ? "#fff" : "#000",
    borderRadius: 12,
    padding: 20,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const columns = [
    { title: "Admin User", dataIndex: "username", key: "user" },
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "Time", dataIndex: "time", key: "time" },
  ];

  // Animate stats numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayStats((prev) => {
        const updated = {};
        let changed = false;
        for (let key in stats) {
          if (prev[key] < stats[key]) {
            updated[key] = Math.min(prev[key] + 1, stats[key]);
            changed = true;
          } else {
            updated[key] = stats[key];
          }
        }
        return changed ? updated : prev;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [stats]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await api.get("/dashboard/activities");
      setRecentActivities(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch recent activities");
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchActivities();

    const socket = io(SOCKET_URL);
    socket.on("new-activity", (activity) => {
      setRecentActivities((prev) => {
        const updated = [activity, ...prev].slice(0, 5);
        setHighlightedKey(activity.key || activity._id || Date.now());
        setTimeout(() => setHighlightedKey(null), 2000);
        return updated;
      });
    });

    return () => socket.disconnect();
  }, []);

  const statCards = [
    { key: "societies", title: "Societies", color: "#1890ff" },
    { key: "user", title: "Admins", color: "#52c41a" },
    { key: "residents", title: "Residents", color: "#faad14" },
    { key: "visitors", title: "Visitors", color: "#eb2f96" },
  ];

  return (
    <AdminLayout>
      <h2 style={{ marginBottom: 20 }}>Dashboard</h2>

      <Row gutter={[16, 16]}>
        {statCards.map(({ key, title, color }) => (
          <Col xs={24} sm={12} md={6} key={key}>
            <Card
              style={{
                ...cardStyle,
                borderTop: `4px solid ${color}`,
                cursor: "pointer",
              }}
              hoverable
              className={displayStats[key] < stats[key] ? "pulse-card" : ""}
            >
              {loadingStats ? (
                <SocietyLoader inline size="xs" showText={false} />
              ) : (
                <Statistic title={title} value={displayStats[key]} valueStyle={{ color }} />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Recent Activities" style={{ marginTop: 30, ...cardStyle }}>
        {loadingActivities ? (
          <SocietyLoader inline size="xs" showText={false} />
        ) : (
          <Table
            dataSource={recentActivities.map((a) => ({
              ...a,
              rowClass: highlightedKey === a.key ? "highlight-row" : "",
            }))}
            columns={columns}
            rowKey={(record) => record.key || record._id || record.time}
            pagination={false}
            rowClassName={(record) =>
              highlightedKey === record.key ? "highlight-row" : ""
            }
          />
        )}
      </Card>
    </AdminLayout>
  );
}
