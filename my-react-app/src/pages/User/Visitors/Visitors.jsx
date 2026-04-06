import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import { io } from "socket.io-client";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import api from "@/api/api";

const PURPOSE_OPTIONS = [
  "Family Visit",
  "Friends Visit",
  "Delivery",
  "Service",
  "Medical",
  "Other",
];

const STATUS_COLORS = {
  pending: "orange",
  approved: "blue",
  rejected: "red",
  arrived: "green",
  cancelled: "default",
};

export default function VisitorsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [qrModal, setQrModal] = useState({
    open: false,
    value: "",
    visitorName: "",
  });

  const pendingCount = useMemo(
    () => visitors.filter((item) => item.status === "pending").length,
    [visitors]
  );
  const arrivedCount = useMemo(
    () => visitors.filter((item) => item.status === "arrived").length,
    [visitors]
  );

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitors/my");
      setVisitors(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    const societyId = localStorage.getItem("societyId");
    if (societyId) {
      socket.emit("joinSociety", societyId);
    }

    const refresh = () => fetchVisitors();
    socket.on("visitorUpdated", refresh);
    socket.on("visitorArrived", refresh);

    return () => {
      socket.off("visitorUpdated", refresh);
      socket.off("visitorArrived", refresh);
      socket.disconnect();
    };
  }, []);

  const handleRegisterVisitor = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        scheduledFor: values.scheduledFor.toISOString(),
      };

      const res = await api.post("/visitors/register", payload);
      const created = res.data?.data;
      message.success("Visitor registered successfully");
      form.resetFields();
      await fetchVisitors();

      if (created?.qrCodeData) {
        setQrModal({
          open: true,
          value: created.qrCodeData,
          visitorName: created.visitorName || "Visitor",
        });
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to register visitor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (visitorId, status) => {
    try {
      await api.patch(`/visitors/${visitorId}/approval`, { status });
      message.success(
        status === "approved"
          ? "Visitor approved successfully"
          : "Visitor rejected"
      );
      fetchVisitors();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      title: "Visitor",
      dataIndex: "visitorName",
      key: "visitorName",
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "Scheduled Time",
      dataIndex: "scheduledFor",
      key: "scheduledFor",
      render: (value) => dayjs(value).format("DD MMM YYYY, hh:mm A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {String(status).toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "QR",
      key: "qr",
      render: (_, record) => (
        <Button
          onClick={() =>
            setQrModal({
              open: true,
              value: record.qrCodeData || record.qrToken,
              visitorName: record.visitorName || "Visitor",
            })
          }
        >
          Show QR
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.status !== "pending") return "-";
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => handleApproval(record._id, "approved")}
            >
              Approve
            </Button>
            <Button danger onClick={() => handleApproval(record._id, "rejected")}>
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <ResidentLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ marginBottom: 0 }}>
          Visitor Panel
        </Typography.Title>
        <Typography.Text type="secondary">
          Register visitors, share QR, track approvals, and see arrival status.
        </Typography.Text>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="Pending Approval">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {pendingCount}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Arrived">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {arrivedCount}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Total Visitors">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {visitors.length}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        <Card title="Register Visitor">
          <Form form={form} layout="vertical" onFinish={handleRegisterVisitor}>
            <Row gutter={[16, 8]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Visitor Name"
                  name="visitorName"
                  rules={[{ required: true, message: "Visitor name is required" }]}
                >
                  <Input placeholder="Enter visitor name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: "Phone number is required" }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Vehicle Number" name="vehicleNumber">
                  <Input placeholder="Optional" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Purpose"
                  name="purpose"
                  rules={[{ required: true, message: "Purpose is required" }]}
                >
                  <Select
                    placeholder="Select purpose"
                    options={PURPOSE_OPTIONS.map((value) => ({
                      label: value,
                      value,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Visit Time"
                  name="scheduledFor"
                  rules={[{ required: true, message: "Visit time is required" }]}
                >
                  <DatePicker
                    showTime
                    format="DD MMM YYYY, hh:mm A"
                    style={{ width: "100%" }}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Notes" name="notes">
                  <Input placeholder="Optional note for gate" />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Register Visitor
            </Button>
          </Form>
        </Card>

        <Card title="Approval Status Tracking">
          <Table
            loading={loading}
            dataSource={visitors}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </Space>

      <Modal
        open={qrModal.open}
        footer={null}
        title={`QR for ${qrModal.visitorName}`}
        onCancel={() => setQrModal({ open: false, value: "", visitorName: "" })}
      >
        <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
          {qrModal.value ? (
            <>
              <QRCodeCanvas value={qrModal.value} size={240} />
              <Typography.Text type="secondary">
                Show this QR at the gate for quick entry.
              </Typography.Text>
            </>
          ) : (
            <Typography.Text type="secondary">QR not available</Typography.Text>
          )}
        </div>
      </Modal>
    </ResidentLayout>
  );
}
