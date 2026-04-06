import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Select, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

const DELIVERY_PARTNERS = ["Zomato", "Swiggy", "Amazon", "Flipkart", "Other"];

export default function DeliveryManagement() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deliveries, setDeliveries] = useState([]);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitors/gate", { params: { today: true } });
      const items = (res.data?.data || []).filter(
        (v) => String(v.purpose || "").toLowerCase() === "delivery"
      );
      setDeliveries(items);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      await api.post("/visitors/register", {
        visitorName: values.visitorName,
        phone: values.phone,
        flatNo: values.flatNo,
        wing: values.wing,
        purpose: "Delivery",
        deliveryPartner: values.deliveryPartner,
        vehicleNumber: values.vehicleNumber,
        notes: values.notes,
      });
      message.success("Delivery entry added");
      form.resetFields();
      await fetchDeliveries();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to add delivery");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: deliveries.length,
      inside: deliveries.filter((d) => d.status === "arrived").length,
      left: deliveries.filter((d) => d.status === "exited").length,
    }),
    [deliveries]
  );

  const columns = [
    { title: "Name", dataIndex: "visitorName", key: "visitorName" },
    { title: "Mobile", dataIndex: "phone", key: "phone" },
    { title: "Partner", dataIndex: "deliveryPartner", key: "deliveryPartner" },
    { title: "Wing", key: "wing", render: (_, r) => r.wingId?.wing || r.wingId?.code || "-" },
    { title: "Flat", key: "flat", render: (_, r) => r.residentId?.flatNo || "-" },
    {
      title: "Entry",
      dataIndex: "scheduledFor",
      key: "scheduledFor",
      render: (v) => dayjs(v).format("hh:mm A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag>{String(s || "").toUpperCase()}</Tag>,
    },
  ];

  return (
    <GuardLayout onRefresh={fetchDeliveries} refreshing={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Today's Deliveries">{stats.total}</Card>
          </Col>
          <Col span={8}>
            <Card title="Inside">{stats.inside}</Card>
          </Col>
          <Col span={8}>
            <Card title="Left">{stats.left}</Card>
          </Col>
        </Row>

        <Card title="Add Delivery Entry">
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item name="visitorName" label="Delivery Person" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="phone" label="Mobile" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="deliveryPartner" label="Partner" rules={[{ required: true }]}>
                  <Select options={DELIVERY_PARTNERS.map((x) => ({ label: x, value: x }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="wing" label="Wing" rules={[{ required: true }]}>
                  <Input placeholder="A/B/C" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="flatNo" label="Flat No" rules={[{ required: true }]}>
                  <Input placeholder="B-302" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="vehicleNumber" label="Vehicle No">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save Delivery
            </Button>
          </Form>
        </Card>

        <Card title="Delivery List">
          <Table rowKey="_id" loading={loading} columns={columns} dataSource={deliveries} />
        </Card>
      </Space>
    </GuardLayout>
  );
}
