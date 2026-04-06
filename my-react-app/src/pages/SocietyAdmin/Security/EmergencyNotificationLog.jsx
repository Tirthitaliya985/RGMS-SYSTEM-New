import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Input, Row, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import api from "@/api/api";

const ALERT_STATUS_OPTIONS = [
  { label: "All Alerts", value: "all" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
];

export default function EmergencyNotificationLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (status !== "all") params.status = status;
      if (query.trim()) params.q = query.trim();

      const res = await api.get("/guard/emergency-alerts", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load emergency logs");
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const columns = [
    { title: "Type", dataIndex: "type", key: "type", width: 120 },
    { title: "Wing", dataIndex: "wing", key: "wing", render: (v) => v || "-" },
    { title: "Flat", dataIndex: "flatNo", key: "flatNo", width: 110 },
    { title: "Details", dataIndex: "details", key: "details", render: (v) => v || "-" },
    {
      title: "Alert Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) => (
        <Tag color={s === "open" ? "red" : "green"}>{String(s || "").toUpperCase()}</Tag>
      ),
    },
    {
      title: "WhatsApp",
      key: "whatsapp",
      width: 170,
      render: (_, record) => {
        const sent = Number(record?.notification?.sent || 0);
        const failed = Number(record?.notification?.failed || 0);
        if (!record?.notification?.attemptedAt) {
          return <Tag color="default">Not Attempted</Tag>;
        }
        if (failed > 0 && sent === 0) return <Tag color="red">Failed</Tag>;
        if (failed > 0 && sent > 0) return <Tag color="orange">Partial</Tag>;
        return <Tag color="green">Delivered</Tag>;
      },
    },
    {
      title: "Sent/Failed",
      key: "counts",
      width: 120,
      render: (_, record) =>
        `${Number(record?.notification?.sent || 0)} / ${Number(record?.notification?.failed || 0)}`,
    },
    {
      title: "Last Attempt",
      dataIndex: ["notification", "attemptedAt"],
      key: "attemptedAt",
      width: 170,
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "-"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (v) => dayjs(v).format("DD MMM YYYY, hh:mm A"),
    },
  ];

  return (
    <SocietyLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Emergency Notification Logs
        </Typography.Title>

        <Card>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={fetchRows}
                placeholder="Search by flat, wing, details"
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={status}
                onChange={setStatus}
                options={ALERT_STATUS_OPTIONS}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} md={10}>
              <Space>
                <Button type="primary" onClick={fetchRows} loading={loading}>
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table rowKey="_id" loading={loading} columns={columns} dataSource={rows} scroll={{ x: 1200 }} />
        </Card>
      </Space>
    </SocietyLayout>
  );
}
