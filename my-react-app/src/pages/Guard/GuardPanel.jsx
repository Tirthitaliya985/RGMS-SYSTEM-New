import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
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
import { io } from "socket.io-client";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

const PURPOSE_OPTIONS = [
  { label: "Visitor", value: "Visitor" },
  { label: "Delivery", value: "Delivery" },
  { label: "Cab", value: "Cab" },
  { label: "Guest", value: "Guest" },
];

const DELIVERY_PARTNERS = [
  { label: "Zomato", value: "Zomato" },
  { label: "Swiggy", value: "Swiggy" },
  { label: "Amazon", value: "Amazon" },
  { label: "Flipkart", value: "Flipkart" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Inside", value: "arrived" },
  { label: "Left", value: "exited" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_COLORS = {
  pending: "orange",
  approved: "blue",
  rejected: "red",
  arrived: "green",
  exited: "default",
  cancelled: "default",
};

const tokenFromInput = (value = "") => String(value).replace("RGMS_VISITOR:", "").trim();

const getWingLabel = (record) =>
  record?.wingId?.wing || record?.wingId?.code || record?.residentId?.wing || "-";

const getStatusLabel = (status) => {
  if (status === "arrived") return "INSIDE";
  if (status === "exited") return "LEFT";
  return String(status || "").toUpperCase();
};

export default function GuardPanel() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrInput, setQrInput] = useState("");
  const [verifyModal, setVerifyModal] = useState({ open: false, record: null });

  const selectedPurpose = Form.useWatch("purpose", form);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const params = { today: true };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/visitors/gate", { params });
      setVisitors(res.data?.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load visitors");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

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
  }, [fetchVisitors]);

  const filteredVisitors = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter((item) => {
      const visitorName = String(item.visitorName || "").toLowerCase();
      const phone = String(item.phone || "").toLowerCase();
      const flat = String(item.residentId?.flatNo || "").toLowerCase();
      return visitorName.includes(q) || phone.includes(q) || flat.includes(q);
    });
  }, [searchText, visitors]);

  const stats = useMemo(
    () => ({
      total: visitors.length,
      inside: visitors.filter((v) => v.status === "arrived").length,
      left: visitors.filter((v) => v.status === "exited").length,
      pending: visitors.filter((v) => v.status === "pending").length,
    }),
    [visitors]
  );

  const handleVisitorEntry = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        visitorName: values.visitorName,
        phone: values.phone,
        flatNo: values.flatNo,
        wing: values.wing,
        purpose: values.purpose,
        deliveryPartner: values.deliveryPartner,
        vehicleNumber: values.vehicleNumber,
        photo: values.photo,
        notes: values.notes,
        scheduledFor: new Date().toISOString(),
      };
      await api.post("/visitors/register", payload);
      message.success("Visitor entry created. Resident approval request sent.");
      form.resetFields();
      await fetchVisitors();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create visitor entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGateDecision = async (visitorId, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/visitors/${visitorId}/gate-approval`, { status });
      message.success(status === "approved" ? "Visitor approved" : "Visitor rejected");
      await fetchVisitors();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update approval");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkInside = async (visitorId) => {
    try {
      setActionLoading(true);
      await api.patch("/visitors/arrival", { visitorId });
      message.success("Entry time recorded");
      await fetchVisitors();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to mark entry");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkExit = async (visitorId) => {
    try {
      setActionLoading(true);
      await api.patch("/visitors/exit", { visitorId });
      message.success("Exit time recorded");
      await fetchVisitors();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to mark exit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyQr = async () => {
    const qrToken = tokenFromInput(qrInput);
    if (!qrToken) {
      message.warning("Enter valid QR token");
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.get(`/visitors/qr/${qrToken}`);
      setVerifyModal({ open: true, record: res.data?.data || null });
    } catch (err) {
      message.error(err.response?.data?.message || "QR not found");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { title: "Visitor Name", dataIndex: "visitorName", key: "visitorName" },
    { title: "Mobile", dataIndex: "phone", key: "phone", render: (v) => v || "-" },
    { title: "Wing", key: "wing", render: (_, record) => getWingLabel(record) },
    {
      title: "Flat",
      key: "flat",
      render: (_, record) => record.residentId?.flatNo || "-",
    },
    {
      title: "Purpose",
      key: "purpose",
      render: (_, record) =>
        record.deliveryPartner
          ? `${record.purpose} (${record.deliveryPartner})`
          : record.purpose,
    },
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
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space wrap>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                loading={actionLoading}
                onClick={() => handleGateDecision(record._id, "approved")}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                loading={actionLoading}
                onClick={() => handleGateDecision(record._id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === "approved" && (
            <Button
              type="primary"
              size="small"
              loading={actionLoading}
              onClick={() => handleMarkInside(record._id)}
            >
              Mark Inside
            </Button>
          )}
          {record.status === "arrived" && (
            <Button
              size="small"
              loading={actionLoading}
              onClick={() => handleMarkExit(record._id)}
            >
              Exit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <GuardLayout onRefresh={fetchVisitors} refreshing={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Guard Visitor Panel
        </Typography.Title>
        <Typography.Text type="secondary">
          Add visitor entry, manage approvals, mark exit, and scan resident QR at gate.
        </Typography.Text>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card title="Today's Visitors">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {stats.total}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="Inside">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {stats.inside}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="Left">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {stats.left}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="Pending Approval">
              <Typography.Title level={2} style={{ margin: 0 }}>
                {stats.pending}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        <Card title="Visitor Entry (Entry Time Auto)">
          <Form form={form} layout="vertical" onFinish={handleVisitorEntry}>
            <Row gutter={[12, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Visitor Name"
                  name="visitorName"
                  rules={[{ required: true, message: "Visitor name is required" }]}
                >
                  <Input placeholder="Raj Patel" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Mobile Number"
                  name="phone"
                  rules={[{ required: true, message: "Mobile number is required" }]}
                >
                  <Input placeholder="9876543210" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Visiting Flat No"
                  name="flatNo"
                  rules={[{ required: true, message: "Flat no is required" }]}
                >
                  <Input placeholder="B-302" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Wing"
                  name="wing"
                  rules={[{ required: true, message: "Wing is required" }]}
                >
                  <Input placeholder="B" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Purpose"
                  name="purpose"
                  rules={[{ required: true, message: "Purpose is required" }]}
                >
                  <Select options={PURPOSE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Delivery Partner" name="deliveryPartner">
                  <Select
                    allowClear
                    disabled={selectedPurpose !== "Delivery"}
                    options={DELIVERY_PARTNERS}
                    placeholder="Zomato / Swiggy / Amazon / Flipkart"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Vehicle Number (optional)" name="vehicleNumber">
                  <Input placeholder="MH12AB1234" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Photo URL (optional)" name="photo">
                  <Input placeholder="https://..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Notes (optional)" name="notes">
                  <Input placeholder="Gate notes" />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Add Visitor Entry
            </Button>
          </Form>
        </Card>

        <Card title="QR Code Entry / Verification">
          <Space wrap>
            <Input
              style={{ width: 360 }}
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Scan or paste RGMS_VISITOR token"
            />
            <Button type="primary" onClick={handleVerifyQr} loading={actionLoading}>
              Verify QR
            </Button>
          </Space>
        </Card>

        <Card
          title="Today's Visitors List"
          extra={
            <Space>
              <Input.Search
                placeholder="Search by mobile / flat / name"
                allowClear
                style={{ width: 320 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={setStatusFilter}
                style={{ width: 180 }}
              />
            </Space>
          }
        >
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={filteredVisitors}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </Space>

      <Modal
        open={verifyModal.open}
        footer={null}
        title="QR Verification Result"
        onCancel={() => setVerifyModal({ open: false, record: null })}
      >
        {verifyModal.record ? (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            {verifyModal.record.status === "pending" && (
              <Alert
                type="warning"
                showIcon
                message="Resident approval pending"
                description="Resident has been notified on WhatsApp."
              />
            )}
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Visitor">
                {verifyModal.record.visitorName}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {verifyModal.record.phone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Wing">
                {getWingLabel(verifyModal.record)}
              </Descriptions.Item>
              <Descriptions.Item label="Flat">
                {verifyModal.record.residentId?.flatNo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Purpose">
                {verifyModal.record.deliveryPartner
                  ? `${verifyModal.record.purpose} (${verifyModal.record.deliveryPartner})`
                  : verifyModal.record.purpose}
              </Descriptions.Item>
              <Descriptions.Item label="Entry Time">
                {verifyModal.record.scheduledFor
                  ? dayjs(verifyModal.record.scheduledFor).format("DD MMM YYYY, hh:mm A")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLORS[verifyModal.record.status] || "default"}>
                  {getStatusLabel(verifyModal.record.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        ) : (
          <Typography.Text type="secondary">No visitor found</Typography.Text>
        )}
      </Modal>
    </GuardLayout>
  );
}
