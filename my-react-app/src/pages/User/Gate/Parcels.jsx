import { useCallback, useEffect, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import api from "@/api/api";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Collected", value: "collected" },
];

export default function ResidentParcels() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = { today: true };
      if (status !== "all") params.status = status;
      if (search.trim()) params.q = search.trim();
      const res = await api.get("/resident/gate/parcels", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

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
    socket.on("parcelUpdated", refresh);

    return () => {
      socket.off("parcelUpdated", refresh);
      socket.disconnect();
    };
  }, [fetchRows]);

  const markCollected = async (id) => {
    try {
      setLoading(true);
      await api.patch(`/resident/gate/parcels/${id}/collect`);
      message.success("Parcel marked collected");
      await fetchRows();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update parcel");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Courier", dataIndex: "courier", key: "courier" },
    { title: "Tracking", dataIndex: "trackingId", key: "trackingId", render: (v) => v || "-" },
    { title: "Wing", dataIndex: "wing", key: "wing", render: (v) => v || "-" },
    { title: "Received At", dataIndex: "receivedAt", key: "receivedAt", render: (v) => dayjs(v).format("DD MMM, hh:mm A") },
    { title: "Collected At", dataIndex: "collectedAt", key: "collectedAt", render: (v) => (v ? dayjs(v).format("DD MMM, hh:mm A") : "-") },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "pending" ? "orange" : "green"}>{String(s || "").toUpperCase()}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, r) =>
        r.status === "pending" ? (
          <Button size="small" onClick={() => markCollected(r._id)} loading={loading}>
            Mark Collected
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <ResidentLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          My Parcels
        </Typography.Title>
        <Card
          title="Parcel Tracking"
          extra={
            <Space>
              <Input
                placeholder="Search tracking / courier"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 240 }}
              />
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
