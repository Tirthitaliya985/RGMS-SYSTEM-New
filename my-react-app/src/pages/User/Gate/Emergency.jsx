import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Form, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/backendConfig";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import api from "@/api/api";

const TYPE_OPTIONS = [
  { label: "Security", value: "Security" },
  { label: "Medical", value: "Medical" },
  { label: "Fire", value: "Fire" },
  { label: "Lift", value: "Lift" },
  { label: "Other", value: "Other" },
];

export default function ResidentEmergency() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/resident/gate/emergency-alerts");
      setRows(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const societyId = localStorage.getItem("societyId");
    if (societyId) {
      socket.emit("joinSociety", societyId);
    }

    const refresh = () => fetchRows();
    socket.on("emergencyUpdated", refresh);

    return () => {
      socket.off("emergencyUpdated", refresh);
      socket.disconnect();
    };
  }, [fetchRows]);

  const createAlert = async (values) => {
    try {
      setSubmitting(true);
      await api.post("/resident/gate/emergency-alerts", values);
      message.success("Emergency alert sent to gate");
      form.resetFields();
      await fetchRows();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create emergency alert");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Details", dataIndex: "details", key: "details", render: (v) => v || "-" },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt", render: (v) => dayjs(v).format("DD MMM, hh:mm A") },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "open" ? "red" : "green"}>{String(s || "").toUpperCase()}</Tag>,
    },
  ];

  return (
    <ResidentLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Emergency Alerts
        </Typography.Title>
        <Alert
          type="warning"
          showIcon
          message="Use in urgent situations"
          description="These alerts are visible to guard panel immediately."
        />

        <Card title="Raise Emergency">
          <Form form={form} layout="vertical" onFinish={createAlert}>
            <Form.Item name="type" label="Alert Type" initialValue="Security" rules={[{ required: true }]}>
              <Select options={TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="details" label="Details">
              <Input.TextArea rows={3} placeholder="Briefly describe emergency" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Send Alert
            </Button>
          </Form>
        </Card>

        <Card title="My Alert History">
          <Table rowKey="_id" loading={loading} columns={columns} dataSource={rows} />
        </Card>
      </Space>
    </ResidentLayout>
  );
}
