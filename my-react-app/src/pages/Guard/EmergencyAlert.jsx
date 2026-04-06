import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

const ALERT_TYPES = ["Medical", "Fire", "Security", "Lift", "Other"];

export default function EmergencyAlert() {
  const [type, setType] = useState("Security");
  const [flat, setFlat] = useState("");
  const [wing, setWing] = useState("");
  const [details, setDetails] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/guard/emergency-alerts");
      setAlerts(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load emergency alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    const societyId = localStorage.getItem("societyId");
    if (societyId) {
      socket.emit("joinSociety", societyId);
    }

    const refresh = () => fetchAlerts();
    socket.on("emergencyUpdated", refresh);

    return () => {
      socket.off("emergencyUpdated", refresh);
      socket.disconnect();
    };
  }, [fetchAlerts]);

  const pushAlert = async () => {
    if (!flat.trim()) {
      message.warning("Flat number is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/guard/emergency-alerts", {
        type,
        wing: wing.trim() || undefined,
        flatNo: flat.trim(),
        details: details.trim() || undefined,
      });
      message.success("Emergency alert created");
      setFlat("");
      setWing("");
      setDetails("");
      await fetchAlerts();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create emergency alert");
    } finally {
      setSubmitting(false);
    }
  };

  const resolveAlert = async (id) => {
    try {
      await api.patch(`/guard/emergency-alerts/${id}/resolve`);
      message.success("Alert resolved");
      await fetchAlerts();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to resolve alert");
    }
  };

  const columns = [
    { title: "Type", dataIndex: "type", key: "type", width: 120 },
    { title: "Wing", dataIndex: "wing", key: "wing", width: 100, render: (v) => v || "-" },
    { title: "Flat", dataIndex: "flatNo", key: "flatNo", width: 100 },
    { title: "Details", dataIndex: "details", key: "details", render: (v) => v || "-" },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (v) => dayjs(v).format("DD MMM YYYY, hh:mm A"),
    },
    {
      title: "WhatsApp",
      key: "whatsapp",
      width: 120,
      render: (_, record) => {
        const sent = Number(record?.notification?.sent || 0);
        const failed = Number(record?.notification?.failed || 0);
        if (!record?.notification?.attemptedAt) return <Tag>NA</Tag>;
        if (failed > 0 && sent === 0) return <Tag color="red">FAILED</Tag>;
        if (failed > 0 && sent > 0) return <Tag color="orange">PARTIAL</Tag>;
        return <Tag color="green">SENT</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s) => <Tag color={s === "open" ? "red" : "green"}>{String(s).toUpperCase()}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, r) =>
        r.status === "open" ? (
          <Button size="small" onClick={() => resolveAlert(r._id)}>
            Resolve
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <GuardLayout onRefresh={fetchAlerts} refreshing={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Alert
          type="warning"
          showIcon
          message="Emergency Alerts"
          description="Create and track emergencies. Society and wing admins receive WhatsApp notifications."
        />
        <Card title="Create Emergency Alert">
          <Space wrap>
            <Select
              value={type}
              onChange={setType}
              options={ALERT_TYPES.map((x) => ({ label: x, value: x }))}
              style={{ width: 180 }}
            />
            <Input
              placeholder="Wing (optional)"
              value={wing}
              onChange={(e) => setWing(e.target.value)}
              style={{ width: 160 }}
            />
            <Input
              placeholder="Flat No"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ width: 320 }}
            />
            <Button danger type="primary" onClick={pushAlert} loading={submitting}>
              Trigger Alert
            </Button>
          </Space>
        </Card>

        <Card title="Emergency Alert Log">
          {alerts.length === 0 ? (
            <Typography.Text type="secondary">No alerts logged</Typography.Text>
          ) : (
            <Table rowKey="_id" columns={columns} dataSource={alerts} loading={loading} scroll={{ x: 1050 }} />
          )}
        </Card>
      </Space>
    </GuardLayout>
  );
}
