import { useEffect, useMemo, useState } from "react";
import { Button, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import AdminLayout from "@/components/Layout/AdminLayout";
import api from "@/api/api";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Visited"];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
};

export default function DemoVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/v-visitors");
      setVisitors(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to load demo visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleStatusChange = async (record, status) => {
    try {
      setUpdatingId(record._id);
      const res = await api.put(`/v-visitors/${record._id}`, { status });
      const updated = res.data?.data;
      setVisitors((prev) => prev.map((item) => (item._id === record._id ? updated : item)));
      message.success("Status updated");
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (record) => {
    try {
      setDeletingId(record._id);
      await api.delete(`/v-visitors/${record._id}`);
      setVisitors((prev) => prev.filter((item) => item._id !== record._id));
      message.success("Demo visitor deleted");
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to delete demo visitor");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVisitors = useMemo(() => {
    if (statusFilter === "all") return visitors;
    return visitors.filter((item) => item.status === statusFilter);
  }, [visitors, statusFilter]);

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.firstName || ""} ${record.lastName || ""}`.trim() || "-",
    },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Location",
      key: "location",
      render: (_, record) => `${record.city || "-"}, ${record.state || "-"}`,
    },
    { title: "Visit Date", dataIndex: "visitDate", key: "visitDate", render: formatDate },
    { title: "Visit Time", dataIndex: "visitTime", key: "visitTime" },
    { title: "Purpose", dataIndex: "purpose", key: "purpose" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Approved" ? "green" : status === "Rejected" ? "red" : status === "Visited" ? "blue" : "gold";
        return <Tag color={color}>{status || "Pending"}</Tag>;
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Select
            size="small"
            value={record.status || "Pending"}
            style={{ width: 120 }}
            loading={updatingId === record._id}
            onChange={(value) => handleStatusChange(record, value)}
            options={STATUS_OPTIONS.map((status) => ({ label: status, value: status }))}
          />
          <Popconfirm
            title="Delete this request?"
            okButtonProps={{ loading: deletingId === record._id }}
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Demo Visitors
        </Typography.Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: "All Statuses", value: "all" },
              ...STATUS_OPTIONS.map((status) => ({ label: status, value: status })),
            ]}
          />
          <Button onClick={fetchVisitors} loading={loading}>
            Refresh
          </Button>
        </Space>
      </Space>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={filteredVisitors}
        pagination={{ pageSize: 10 }}
      />
    </AdminLayout>
  );
}
