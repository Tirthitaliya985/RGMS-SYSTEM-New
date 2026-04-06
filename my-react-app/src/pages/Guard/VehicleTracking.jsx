import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

export default function VehicleTracking() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitors/gate", { params: { today: true } });
      const items = (res.data?.data || []).filter((v) => v.vehicleNumber);
      setRows(items);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const vehicle = String(r.vehicleNumber || "").toLowerCase();
      const name = String(r.visitorName || "").toLowerCase();
      const flat = String(r.residentId?.flatNo || "").toLowerCase();
      return vehicle.includes(q) || name.includes(q) || flat.includes(q);
    });
  }, [rows, search]);

  const markExit = async (id) => {
    try {
      setLoading(true);
      await api.patch("/visitors/exit", { visitorId: id });
      message.success("Vehicle exited");
      await fetchVehicles();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to mark exit");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Vehicle Number", dataIndex: "vehicleNumber", key: "vehicleNumber" },
    { title: "Visitor", dataIndex: "visitorName", key: "visitorName" },
    { title: "Flat", key: "flat", render: (_, r) => r.residentId?.flatNo || "-" },
    { title: "Wing", key: "wing", render: (_, r) => r.wingId?.wing || r.wingId?.code || "-" },
    { title: "Entry Time", dataIndex: "scheduledFor", key: "scheduledFor", render: (v) => dayjs(v).format("hh:mm A") },
    { title: "Exit Time", dataIndex: "exitedAt", key: "exitedAt", render: (v) => (v ? dayjs(v).format("hh:mm A") : "-") },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag>{String(s || "").toUpperCase()}</Tag> },
    {
      title: "Action",
      key: "action",
      render: (_, r) =>
        r.status === "arrived" ? (
          <Button size="small" onClick={() => markExit(r._id)} loading={loading}>
            Mark Exit
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <GuardLayout onRefresh={fetchVehicles} refreshing={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card
          title="Vehicle Tracking"
          extra={
            <Input
              placeholder="Search vehicle / visitor / flat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />
          }
        >
          <Table rowKey="_id" columns={columns} dataSource={filtered} loading={loading} />
        </Card>
      </Space>
    </GuardLayout>
  );
}
