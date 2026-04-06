import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Col, Input, Row, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import api from "@/api/api";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Inside", value: "arrived" },
  { label: "Left", value: "exited" },
  { label: "Rejected", value: "rejected" },
];

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Delivery", value: "delivery" },
  { label: "Worker", value: "worker" },
  { label: "Vehicle", value: "vehicle" },
];

const STATUS_COLORS = {
  pending: "orange",
  approved: "blue",
  rejected: "red",
  arrived: "green",
  exited: "default",
};

export default function GateUpdates() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = { today: true };
      if (status !== "all") params.status = status;
      if (category !== "all") params.category = category;
      if (search.trim()) params.q = search.trim();
      const res = await api.get("/resident/gate/visitors", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load gate updates");
    } finally {
      setLoading(false);
    }
  }, [status, category, search]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    const societyId = localStorage.getItem("societyId");
    if (societyId) {
      socket.emit("joinSociety", societyId);
    }

    const refresh = () => fetchRows();
    socket.on("visitorUpdated", refresh);
    socket.on("visitorArrived", refresh);

    return () => {
      socket.off("visitorUpdated", refresh);
      socket.off("visitorArrived", refresh);
      socket.disconnect();
    };
  }, [fetchRows]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      inside: rows.filter((r) => r.status === "arrived").length,
      left: rows.filter((r) => r.status === "exited").length,
      pending: rows.filter((r) => r.status === "pending").length,
    }),
    [rows]
  );

  const columns = [
    { title: "Visitor", dataIndex: "visitorName", key: "visitorName" },
    { title: "Phone", dataIndex: "phone", key: "phone", render: (v) => v || "-" },
    {
      title: "Purpose",
      key: "purpose",
      render: (_, r) =>
        r.deliveryPartner ? `${r.purpose} (${r.deliveryPartner})` : r.purpose,
    },
    { title: "Vehicle", dataIndex: "vehicleNumber", key: "vehicleNumber", render: (v) => v || "-" },
    {
      title: "Entry Time",
      dataIndex: "scheduledFor",
      key: "scheduledFor",
      render: (v) => (v ? dayjs(v).format("hh:mm A") : "-"),
    },
    {
      title: "Exit Time",
      dataIndex: "exitedAt",
      key: "exitedAt",
      render: (v) => (v ? dayjs(v).format("hh:mm A") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={STATUS_COLORS[s] || "default"}>{String(s || "").toUpperCase()}</Tag>,
    },
  ];

  return (
    <ResidentLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Gate Updates
        </Typography.Title>
        <Typography.Text type="secondary">
          Track today&apos;s visitor, delivery, worker, and vehicle movement for your flat.
        </Typography.Text>

        <Row gutter={16}>
          <Col span={6}>
            <Card title="Total">{stats.total}</Card>
          </Col>
          <Col span={6}>
            <Card title="Inside">{stats.inside}</Card>
          </Col>
          <Col span={6}>
            <Card title="Left">{stats.left}</Card>
          </Col>
          <Col span={6}>
            <Card title="Pending">{stats.pending}</Card>
          </Col>
        </Row>

        <Card
          title="Today's Timeline"
          extra={
            <Space>
              <Input
                placeholder="Search name / phone / vehicle"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 240 }}
              />
              <Select value={category} options={CATEGORY_OPTIONS} onChange={setCategory} style={{ width: 150 }} />
              <Select value={status} options={STATUS_OPTIONS} onChange={setStatus} style={{ width: 150 }} />
            </Space>
          }
        >
          <Table rowKey="_id" loading={loading} columns={columns} dataSource={rows} />
        </Card>
      </Space>
    </ResidentLayout>
  );
}
