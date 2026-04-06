import { useCallback, useEffect, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

const COURIERS = ["Amazon", "Flipkart", "BlueDart", "Delhivery", "DTDC", "Other"];
const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Collected", value: "collected" },
];

export default function ParcelManagement() {
  const [courier, setCourier] = useState("Amazon");
  const [trackingId, setTrackingId] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [wing, setWing] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = { today: true };
      if (status !== "all") params.status = status;
      if (search.trim()) params.q = search.trim();
      const res = await api.get("/guard/parcels", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

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

  const addParcel = async () => {
    if (!flatNo.trim()) {
      message.warning("Flat number is required");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/guard/parcels", {
        courier,
        trackingId: trackingId.trim() || undefined,
        flatNo: flatNo.trim(),
        wing: wing.trim() || undefined,
      });
      message.success("Parcel added");
      setTrackingId("");
      setFlatNo("");
      setWing("");
      await fetchRows();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to add parcel");
    } finally {
      setSubmitting(false);
    }
  };

  const markCollected = async (id) => {
    try {
      setLoading(true);
      await api.patch(`/guard/parcels/${id}/collect`);
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
    { title: "Tracking ID", dataIndex: "trackingId", key: "trackingId", render: (v) => v || "-" },
    { title: "Wing", dataIndex: "wing", key: "wing", render: (v) => v || "-" },
    { title: "Flat", dataIndex: "flatNo", key: "flatNo" },
    {
      title: "Received",
      dataIndex: "receivedAt",
      key: "receivedAt",
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "-"),
    },
    {
      title: "Collected",
      dataIndex: "collectedAt",
      key: "collectedAt",
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "-"),
    },
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
    <GuardLayout onRefresh={fetchRows} refreshing={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Parcel Management
        </Typography.Title>
        <Card title="Add Parcel">
          <Space wrap>
            <Select
              value={courier}
              onChange={setCourier}
              options={COURIERS.map((x) => ({ label: x, value: x }))}
              style={{ width: 180 }}
            />
            <Input
              placeholder="Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="Wing"
              value={wing}
              onChange={(e) => setWing(e.target.value)}
              style={{ width: 120 }}
            />
            <Input
              placeholder="Flat No"
              value={flatNo}
              onChange={(e) => setFlatNo(e.target.value)}
              style={{ width: 140 }}
            />
            <Button type="primary" onClick={addParcel} loading={submitting}>
              Add Parcel
            </Button>
          </Space>
        </Card>

        <Card
          title="Parcel List"
          extra={
            <Space>
              <Input
                placeholder="Search by tracking / flat / wing"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 240 }}
              />
              <Select
                value={status}
                options={STATUS_OPTIONS}
                onChange={setStatus}
                style={{ width: 150 }}
              />
            </Space>
          }
        >
          <Table rowKey="_id" columns={columns} dataSource={rows} loading={loading} />
        </Card>
      </Space>
    </GuardLayout>
  );
}
